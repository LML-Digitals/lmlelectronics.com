import { getSuppliers } from "../services/supplierCrud";

export async function fetchSuppliers() {
  try {
    const suppliers = await getSuppliers();
    return { suppliers, error: null };
  } catch (err) {
    return { suppliers: [], error: "Failed to fetch suppliers. Please check your connection and try again." };
  }
}
