// Conteneur de page avec padding standard
export default function PageContainer({ children, className = "" }) {
  return (
    <main className={`flex-1 overflow-y-auto p-6 ${className}`}>
      {children}
    </main>
  );
}
