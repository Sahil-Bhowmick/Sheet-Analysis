import Modal from "react-modal";
import ChartRenderer from "./ChartRenderer";
import { FaTimes } from "react-icons/fa";

Modal.setAppElement("#root");

const ChartModal = ({
  selectedChart = null,
  onClose = () => {},
  show = false,
  showDeleteModal = false,
  onDeleteClose = () => {},
  onConfirmDelete = () => {},
}) => {
  return (
    <>
      {/* 📊 Chart Preview Modal */}
      <Modal
        isOpen={show}
        onRequestClose={onClose}
        overlayClassName="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
        className="bg-white max-w-4xl w-[90%] rounded-lg shadow-2xl p-6 outline-none overflow-auto max-h-[90vh]"
      >
        {selectedChart && (
          <div className="w-full relative">
            <button
              onClick={onClose}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
            >
              <FaTimes size={18} />
            </button>
            <h2 className="text-2xl font-semibold text-center text-indigo-700 mb-6">
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

      {/* 🗑️ Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onRequestClose={onDeleteClose}
        overlayClassName="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full"
      >
        <h3 className="text-lg font-semibold text-red-600 mb-4">
          Are you sure you want to delete this chart?
        </h3>
        <div className="flex justify-end gap-4">
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
