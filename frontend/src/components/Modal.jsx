import React from "react";

const Modal = ({
  title,
  message,
  onCancel,
  onConfirm,
  confirmText,
  confirmColor,
}) => (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-xl shadow-xl space-y-4 max-w-sm w-full">
      <h2 className={`text-lg font-semibold text-${confirmColor}-600`}>
        {title}
      </h2>
      <p className="text-sm text-gray-600">{message}</p>
      <div className="flex justify-end gap-2">
        <button
          onClick={onCancel}
          className="px-4 py-2 rounded bg-gray-100 hover:bg-gray-200 text-sm"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className={`px-4 py-2 rounded bg-${confirmColor}-600 hover:bg-${confirmColor}-700 text-white text-sm`}
        >
          {confirmText}
        </button>
      </div>
    </div>
  </div>
);

export default Modal;
