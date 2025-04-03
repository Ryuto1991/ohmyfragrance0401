type ToastFunction = (props: {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
}) => void;

let displayToast: ToastFunction;

export function registerToast(toastFn: ToastFunction) {
  displayToast = toastFn;
}

export function showToast(props: {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
}) {
  if (displayToast) {
    displayToast(props);
  }
} 