import { toast } from 'sonner'

const showToast = (message, type = 'info') => {
    const content = message || '操作完成'
    switch (type) {
        case 'success':
            toast.success(content)
            break
        case 'error':
            toast.error(content)
            break
        case 'warning':
            toast.warning(content)
            break
        default:
            toast.info(content)
    }
}

export { showToast }


