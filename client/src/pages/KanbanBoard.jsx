import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { ArrowLeft, FileText, Mail, Briefcase } from "lucide-react";
import { getJobById } from "../services/jobService";
import {
  getJobApplications,
  updateApplicationStatus,
} from "../services/applicationService";
import { getResumeUrl } from "../services/uploadService";

const COLUMNS = [
  {
    id: "Applied",
    header: "bg-primary/15 text-primary-dark",
    dot: "bg-primary",
  },
  {
    id: "Interview",
    header: "bg-highlight/40 text-orange-700",
    dot: "bg-highlight",
  },
  { id: "Offered", header: "bg-accent/25 text-emerald-700", dot: "bg-accent" },
  {
    id: "Rejected",
    header: "bg-secondary/30 text-purple-700",
    dot: "bg-secondary",
  },
];

const KanbanBoard = () => {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getJobById(jobId), getJobApplications(jobId)])
      .then(([jobRes, appsRes]) => {
        setJob(jobRes.data);
        setApplications(appsRes.data);
      })
      .catch((err) =>
        toast.error(err.response?.data?.message || "Failed to load pipeline"),
      )
      .finally(() => setLoading(false));
  }, [jobId]);

  // Optimistic update: move the card instantly, roll back if the server refuses
  const moveApplication = async (id, newStatus) => {
    const current = applications.find((a) => a._id === id);
    if (!current || current.status === newStatus) return;
    const oldStatus = current.status;

    setApplications((prev) =>
      prev.map((a) => (a._id === id ? { ...a, status: newStatus } : a)),
    );

    try {
      await updateApplicationStatus(id, newStatus);
      toast.success(`Moved to ${newStatus}`);
    } catch (err) {
      setApplications((prev) =>
        prev.map((a) => (a._id === id ? { ...a, status: oldStatus } : a)),
      );
      toast.error(err.response?.data?.message || "Could not update status");
    }
  };

  const onDragEnd = ({ destination, draggableId }) => {
    if (!destination) return;
    moveApplication(draggableId, destination.droppableId);
  };

  const openResume = async (key) => {
    // Open the tab first so popup blockers allow it
    const tab = window.open("", "_blank");
    try {
      const { data } = await getResumeUrl(key);
      tab.location.href = data.url;
    } catch {
      tab?.close();
      toast.error("Could not open resume");
    }
  };

  if (loading)
    return (
      <p className="text-center py-12 text-slate-400">Loading pipeline...</p>
    );
  if (!job)
    return <p className="text-center py-12 text-slate-400">Job not found.</p>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <Link
        to="/recruiter/dashboard"
        className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-primary-dark mb-3"
      >
        <ArrowLeft size={16} /> Back to dashboard
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-1 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-ink">{job.title}</h1>
          <p className="text-slate-500 text-sm">Application pipeline</p>
        </div>
        <p className="text-sm text-slate-500">
          {applications.length} applicant{applications.length !== 1 && "s"}
        </p>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory lg:snap-none">
          {COLUMNS.map((col) => {
            const items = applications.filter((a) => a.status === col.id);
            return (
              <div
                key={col.id}
                className="snap-start shrink-0 w-[85%] sm:w-72 lg:w-auto lg:flex-1 lg:min-w-[240px] bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col"
              >
                <div
                  className={`flex items-center justify-between px-4 py-3 rounded-t-2xl ${col.header}`}
                >
                  <span className="flex items-center gap-2 font-semibold text-sm">
                    <span className={`w-2 h-2 rounded-full ${col.dot}`} />
                    {col.id}
                  </span>
                  <span className="text-xs font-medium bg-white/70 px-2 py-0.5 rounded-full">
                    {items.length}
                  </span>
                </div>

                <Droppable droppableId={col.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-1 p-3 space-y-3 min-h-[160px] rounded-b-2xl transition-colors ${
                        snapshot.isDraggingOver ? "bg-base" : ""
                      }`}
                    >
                      {items.map((app, index) => (
                        <Draggable
                          key={app._id}
                          draggableId={app._id}
                          index={index}
                        >
                          {(drag, dragSnapshot) => (
                            <div
                              ref={drag.innerRef}
                              {...drag.draggableProps}
                              {...drag.dragHandleProps}
                              className={`bg-base rounded-xl border border-slate-100 p-3 text-sm ${
                                dragSnapshot.isDragging ?
                                  "shadow-lg ring-2 ring-primary/40"
                                : ""
                              }`}
                            >
                              <p className="font-semibold text-ink">
                                {app.applicant?.name}
                              </p>
                              {app.applicant?.headline && (
                                <p className="text-xs text-slate-500">
                                  {app.applicant.headline}
                                </p>
                              )}

                              <div className="mt-2 space-y-1 text-xs text-slate-500">
                                <p className="flex items-center gap-1 break-all">
                                  <Mail size={12} /> {app.applicant?.email}
                                </p>
                                <p className="flex items-center gap-1">
                                  <Briefcase size={12} />{" "}
                                  {app.applicant?.experienceYears ?? 0} yrs
                                  experience
                                </p>
                              </div>

                              {app.applicant?.skills?.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {app.applicant.skills.slice(0, 3).map((s) => (
                                    <span
                                      key={s}
                                      className="bg-secondary/25 text-primary-dark text-[11px] px-2 py-0.5 rounded-full"
                                    >
                                      {s}
                                    </span>
                                  ))}
                                </div>
                              )}

                              <div className="flex items-center justify-between gap-2 mt-3">
                                <button
                                  onClick={() => openResume(app.resumeKey)}
                                  className="flex items-center gap-1 text-xs font-medium text-primary-dark hover:underline"
                                >
                                  <FileText size={13} /> Resume
                                </button>

                                {/* Fallback for touch / keyboard users */}
                                <select
                                  value={app.status}
                                  onChange={(e) =>
                                    moveApplication(app._id, e.target.value)
                                  }
                                  className="text-xs border border-slate-200 rounded-lg px-1.5 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-primary/40"
                                  aria-label="Move to stage"
                                >
                                  {COLUMNS.map((c) => (
                                    <option key={c.id}>{c.id}</option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}

                      {items.length === 0 && !snapshot.isDraggingOver && (
                        <p className="text-xs text-slate-400 text-center pt-6">
                          No candidates
                        </p>
                      )}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
};

export default KanbanBoard;
