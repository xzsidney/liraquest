import Swal from 'sweetalert2'

/**
 * Tema Base Gótico / Dark Fantasy do LiraRPG
 */
const gothicBase = Swal.mixin({
  background: '#0a0507',
  color: '#e5e0d8',
  confirmButtonColor: '#991b1b', // Vermelho Sangue
  cancelButtonColor: '#1f2937', // Cinza Escuro
  customClass: {
    popup: 'border-2 border-red-900/80 shadow-[0_0_50px_rgba(153,27,27,0.4)] rounded-xl font-sans',
    title: 'font-serif text-gold tracking-widest uppercase text-lg',
    htmlContainer: 'text-stone-300 text-xs leading-relaxed font-sans',
    confirmButton: 'font-serif uppercase tracking-widest text-xs px-5 py-2.5 rounded font-bold shadow-[0_0_15px_rgba(153,27,27,0.5)]',
    cancelButton: 'font-serif uppercase tracking-widest text-xs px-5 py-2.5 rounded font-bold border border-white/10'
  }
})

export const notifySuccess = (title: string, message?: string) => {
  return gothicBase.fire({
    icon: 'success',
    title: title,
    text: message,
    timer: 3500,
    timerProgressBar: true,
    showConfirmButton: false
  })
}

export const notifyError = (title: string, message?: string) => {
  return gothicBase.fire({
    icon: 'error',
    title: title,
    text: message,
    confirmButtonText: 'Entendido'
  })
}

export const notifyWarning = (title: string, message?: string) => {
  return gothicBase.fire({
    icon: 'warning',
    title: title,
    text: message,
    confirmButtonText: 'Entendido'
  })
}

export const confirmAction = async (title: string, message: string, confirmText = 'Sim, Confirmar', cancelText = 'Cancelar') => {
  const result = await gothicBase.fire({
    title,
    text: message,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    reverseButtons: true
  })
  return result.isConfirmed
}

export default gothicBase
