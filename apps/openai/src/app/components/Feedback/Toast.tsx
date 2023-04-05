import React from "react";
import { AlertProps, Snackbar,Alert } from "@mui/material";

type ToastProps = {
    message: string,
    open: boolean,
    autoClose: boolean,
    onClose?: () => void,
    toastType: number
}



const Toast = ({ onClose, message, open, autoClose, toastType }: ToastProps) => {


    const snackbarProp = () => {
        let props: { autoHideDuration: number | null, message: string } = {
            message,
            autoHideDuration: null
        }
        if (autoClose) {
            props = { ...props, autoHideDuration: 3000 }
        }
        return props
    }

    const severity = () => {
        switch (toastType) {
            case 0:
                return 'info'
            case 1:
                return 'success'
            case 2:
                return 'warning'
            case 3:
                return 'error'
            default:
                return 'info'
        }
    }

    return <Snackbar open={open} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}  {...snackbarProp()} onClose={onClose} >
        <Alert elevation={6} severity={severity()}>{message}</Alert>
    </Snackbar>
}

export default Toast
