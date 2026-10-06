import { ensureDatabaseInitialized, client, INITIAL_PRODUCTS } from "./index";

async function main() {
  console.log("Menjalankan database seed untuk Sugar Bliss Bakery...");
  await ensureDatabaseInitialized();

  const countResult = await client`SELECT COUNT(*)::int as count FROM products`;
  const count = Number(countResult[0]?.count ?? 0);

  console.log(`Database terinisialisasi dengan sukses! Total ${count} produk tersedia di tabel products.`);
  for (const p of INITIAL_PRODUCTS) {
    console.log(` - [${p.id}] ${p.name} (Rp ${p.price.toLocaleString("id-ID")})`);
  }

  await client.end();
  process.exit(0);
}

main().catch((err) => {
  console.error("Gagal melakukan seed database:", err);
  process.exit(1);
});
