// Raw Delivery Request statuses (see erp.x-sha.id Delivery Request doctype)
// translated for display — shared between Pesanan Saya's tabs and the
// notifications feed derived from the same underlying Pesanan data.
export const DELIVERY_STATUS_LABELS: Record<string, string> = {
  Pending: "Menunggu Penugasan",
  Ditugaskan: "Ditugaskan ke Kurir",
  "Dalam Perjalanan": "Dalam Perjalanan",
  Terkirim: "Terkirim",
  Gagal: "Pengiriman Gagal",
};
