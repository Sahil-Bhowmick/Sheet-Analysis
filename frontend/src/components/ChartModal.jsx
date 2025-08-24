import Modal from "react-modal";
import ChartRenderer from "./ChartRenderer";
import { FaTimes } from "react-icons/fa";

Modal.setAppElement("#root");

const ChartModal = ({
  selectedChart = null,
  onClose = () => {},
  show = false,
  // Delete flow props
  showDeleteModal = false,
  onDeleteClose = () => {},
  onConfirmDelete = () => {},
  // either single name (string) or number for bulk
  deleteTargetName = null,
  deleteCount = 0,
}) => {
  const deletingMultiple = Boolean(deleteCount && deleteCount > 1);

  return (
    <>
      {/* 📊 Chart Preview Modal */}
      <Modal
        isOpen={show}
        onRequestClose={onClose}
        overlayClassName="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
        className="bg-white max-w-4xl w-[92%] md:w-3/4 rounded-lg shadow-2xl p-6 outline-none overflow-auto max-h-[90vh]"
      >
        {selectedChart && (
          <div className="w-full relative">
            <button
              onClick={onClose}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
              aria-label="Close preview"
            >
              <FaTimes size={18} />
            </button>

            <h2 className="text-2xl font-semibold text-center text-indigo-700 mb-5">
              {selectedChart.title ||
                `${selectedChart.yKey} vs ${selectedChart.xKey}`}
            </h2>

            <div className="w-full max-w-3xl mx-auto px-2">
              <ChartRenderer
                chartType={selectedChart.chartType}
                xKey={selectedChart.xKey}
                yKey={selectedChart.yKey}
                data={selectedChart.data}
              />
            </div>

            <div className="text-center mt-6">
              <button
                onClick={onClose}
                className="bg-gray-200 hover:bg-gray-300 px-6 py-2 rounded-md text-sm transition"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* 🗑️ Delete Confirmation Modal (supports single + bulk delete) */}
      <Modal
        isOpen={showDeleteModal}
        onRequestClose={onDeleteClose}
        overlayClassName="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full"
      >
        <h3 className="text-lg font-semibold text-red-600 mb-3">
          {deletingMultiple
            ? `Delete ${deleteCount} charts?`
            : `Delete "${deleteTargetName ?? "this chart"}"?`}
        </h3>

        <div className="mb-4 text-sm text-slate-600">
          {deletingMultiple ? (
            <>
              This will permanently remove {deleteCount} chart
              {deleteCount > 1 ? "s" : ""} from your saved charts and history
              (if stored). This action cannot be undone.
            </>
          ) : (
            <>
              Are you sure you want to delete{" "}
              <strong>{deleteTargetName ?? "this chart"}</strong>? This action
              cannot be undone.
            </>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onDeleteClose}
            className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-md"
          >
            Cancel
          </button>
          <button
            onClick={onConfirmDelete}
            className="bg-red-600 text-white hover:bg-red-700 px-4 py-2 rounded-md"
          >
            Delete
          </button>
        </div>
      </Modal>
    </>
  );
};

export default ChartModal;
