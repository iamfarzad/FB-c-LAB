import Layout from '@/components/Layout'; // Assuming a common Layout component
import ImageGeneratorUI from '@/components/generative/ImageGeneratorUI';
import GroundedSearchUI from '@/components/generative/GroundedSearchUI';
import DocumentationGeneratorUI from '@/components/generative/DocumentationGeneratorUI';

const GenerativeToolsPage: React.FC = () => {
  return (
    <Layout>
      <div className="container mx-auto px-6">
        <header style={{ textAlign: 'center', margin: '40px 0' }}>
          <h1>Generative AI Tools</h1>
          <p>Explore various generative capabilities powered by Gemini.</p>
        </header>

        <section id="image-generator">
          <ImageGeneratorUI />
        </section>

        <section id="grounded-search" style={{ marginTop: '40px' }}>
          <GroundedSearchUI />
        </section>

        <section id="documentation-generator" style={{ marginTop: '40px', marginBottom: '40px' }}>
          <DocumentationGeneratorUI />
        </section>
      </div>
    </Layout>
  );
};

export default GenerativeToolsPage;
