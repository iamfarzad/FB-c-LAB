import React from 'react';
import Layout from '../src/components/Layout'; // Assuming a common Layout component
import ImageGeneratorUI from '../src/components/generative/ImageGeneratorUI';
import GroundedSearchUI from '../src/components/generative/GroundedSearchUI';
import DocumentationGeneratorUI from '../src/components/generative/DocumentationGeneratorUI';
import Container from '@/components/Container'; // Assuming Container component for consistent spacing

const GenerativeToolsPage: React.FC = () => {
  return (
    <Layout>
      <Container>
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
      </Container>
    </Layout>
  );
};

export default GenerativeToolsPage;
