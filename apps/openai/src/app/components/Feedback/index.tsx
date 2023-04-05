import Loading from "./Loading";
import Toast from "./Toast";
import * as React from "react";
import Dialog from "./Dialog";

const NOOP = () => {};

type FeedbackProviderProps = {
  children: React.ReactNode;
};

const FeedbackContext = React.createContext({
  showToast: (message: string, type?: number) => {},
  showLoading: (message: string) => {},
  hideLoading: NOOP,
  showDialog: (
    message: string | React.ReactNode,
    title?: string,
    cancel?: string,
    comfirm?: string,
    callback?: (type: number) => void,
    href?: string
  ) => {},
});

const { Consumer, Provider } = FeedbackContext;
type Context = {
  showToast: (message: string, type?: number) => void;
  showLoading: (message: string) => void;
  hideLoading: () => void;
  showDialog: (
    message: string,
    title?: string,
    cancel?: string,
    confirm?: string,
    callback?: (type: number) => void,
    href?: string
  ) => void;
};

const DialogCallbackNOOP = (type: number) => {};

const FeedbackProvider = ({ children }: FeedbackProviderProps) => {
  const dialogCallback = React.useRef(DialogCallbackNOOP);
  const [toastState, setToastState] = React.useState({
    show: false,
    message: "",
    type: 0,
    autoClose: true,
  });
  const [loadingState, setLoadingState] = React.useState({
    show: false,
    message: "",
  });
  const [dialogState, setDialogState] = React.useState<{
    show: boolean;
    content: string | React.ReactNode;
    title: string;
    cancel: string;
    confirm: string;
    href: string;
  }>({
    show: false,
    content: "",
    title: "",
    cancel: "",
    confirm: "",
    href: "",
  });

  const handleToastClose = () => {
    setToastState({ ...toastState, show: false });
  };

  const showToast = (message: string, type: number = 0) => {
    setToastState({ ...toastState, message, type, show: true });
  };

  const showLoading = (message: string) => {
    setLoadingState({ ...loadingState, message, show: true });
  };

  const hideLoading = () => {
    setLoadingState({ ...loadingState, show: false });
  };

  const showDialog = (
    message: string | React.ReactNode,
    title: string = "",
    cancel: string = "",
    confirm: string = "",
    callback: (type: number) => void = DialogCallbackNOOP,
    href: string = ""
  ) => {
    setDialogState({
      ...dialogState,
      show: true,
      title,
      content: message,
      cancel,
      confirm,
      href,
    });
    dialogCallback.current = callback;
  };

  const handleDialogClose = (type: number) => {
    setDialogState({ ...dialogState, show: false });
    dialogCallback.current(type);
  };

  return (
    <Provider value={{ showToast, showLoading, hideLoading, showDialog }}>
      {children}
      {loadingState.show && (
        <Loading show={loadingState.show} message={loadingState.message} />
      )}
      <Toast
        open={toastState.show}
        message={toastState.message}
        autoClose={toastState.autoClose}
        toastType={toastState.type}
        onClose={handleToastClose}
      />
      <Dialog
        open={dialogState.show}
        onClose={handleDialogClose}
        title={dialogState.title}
        content={dialogState.content}
        cancel={dialogState.cancel}
        confirm={dialogState.confirm}
        href={dialogState.href}
      />
    </Provider>
  );
};

export default FeedbackProvider;

export const FeedbackConsumer = ({
  children,
}: {
  children: (ctx: Context) => React.ReactNode;
}) => <Consumer>{(context) => children(context)}</Consumer>;

export const withFeedbackManager = (Comp: React.ComponentType<any>) =>
  React.forwardRef((props, ref) => (
    <FeedbackConsumer>
      {(context) => <Comp feedbackManager={context} {...props} ref={ref} />}
    </FeedbackConsumer>
  ));

export const useFeedback = () => {
  const ctx = React.useContext(FeedbackContext);
  if (!ctx) {
    throw Error(
      "the useFeedback() hook must be called from a descendent of the `FeedbackProvider`"
    );
  }
  return {
    showToast: ctx.showToast,
    showLoading: ctx.showLoading,
    hideLoading: ctx.hideLoading,
    showDialog: ctx.showDialog,
  };
};
