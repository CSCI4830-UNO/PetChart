export default function Footer() {
  return (
    <footer className="border-t border-black/5 py-8 text-center text-sm text-slate-500">
      © {new Date().getFullYear()} PetChart. Built with care for pets.
    </footer>
  );
}
