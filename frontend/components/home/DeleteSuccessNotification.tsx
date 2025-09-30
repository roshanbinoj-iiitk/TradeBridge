import { CheckCircle, X } from "lucide-react";

interface DeleteSuccessNotificationProps {
  show: boolean;
  onHide: () => void;
}

export default function DeleteSuccessNotification({
  show,
  onHide,
}: DeleteSuccessNotificationProps) {
  if (!show) return null;

  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full mx-4">
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg">
        <div className="flex items-start justify-between">
          <div className="flex items-start">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-green-800">
                Account Deleted Successfully
              </h3>
              <p className="text-sm text-green-700 mt-1">
                Your account and all associated data have been permanently
                removed from our system.
              </p>
            </div>
          </div>
          <button
            onClick={onHide}
            className="text-green-400 hover:text-green-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
