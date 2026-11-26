'use client';
// Tombol yang meminta konfirmasi sebelum dijalankan (untuk Hapus).
export default function Confirm({ msg, children, ...props }) {
  return <button {...props} onClick={(e) => { if (!confirm(msg)) e.preventDefault(); }}>{children}</button>;
}
