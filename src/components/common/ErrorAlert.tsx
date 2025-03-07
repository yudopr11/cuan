interface ErrorAlertProps {
  message: string;
}

export default function ErrorAlert({ message }: ErrorAlertProps) {
  return (
    <div className="bg-red-900/30 border border-red-500 text-red-200 p-4 rounded-lg mb-6">
      {message}
    </div>
  );
} 