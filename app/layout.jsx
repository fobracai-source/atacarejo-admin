import "./globals.css";

export const metadata = {
  title: "Atacarejo · Admin",
  description: "Painel administrativo do Atacarejo",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
