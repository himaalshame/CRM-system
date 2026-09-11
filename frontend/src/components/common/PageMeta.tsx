import { HelmetProvider, Helmet } from "react-helmet-async";

const PageMeta = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => {
  const normalizedTitle = title.replace(/CRM/gi, "Nexa CRM");
  const normalizedDescription = description.replace(/CRM/gi, "Nexa CRM");

  return (
    <Helmet>
      <title>{normalizedTitle}</title>
      <meta name="description" content={normalizedDescription} />
    </Helmet>
  );
};

export const AppWrapper = ({ children }: { children: React.ReactNode }) => (
  <HelmetProvider>{children}</HelmetProvider>
);

export default PageMeta;
