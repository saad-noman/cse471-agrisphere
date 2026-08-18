<template>
  <footer class="app-footer">
    <div class="footer-container">
      <div class="footer-top-row">
        

        <div class="footer-attribution">
          <div class="attrib-title">Data Sources & References:</div>
          <div class="attrib-list">
            <div class="attrib-row">
              🌱 <strong>AgriSphere</strong> — Smart Agricultural Insights
            </div>  
            <div class="attrib-list">
        
              <a href="https://barc.gov.bd/" target="_blank" rel="noopener noreferrer" class="footer-link">
                BARC (Bangladesh Agricultural Research Council)
              </a>
            </div>
            <div class="attrib-row">
              <a href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer" class="footer-link">
                Open-Meteo Weather API
              </a>
            </div>
          </div>
        </div>
      </div>

      <div class="footer-copy">
        © 2026 AgriSphere. All rights reserved.
      </div>
    </div>
  </footer>
</template>

<script setup>
</script>

<style scoped>
.app-footer {
  background: #0f172a;
  color: #94a3b8;
  padding: 1.5rem 1.5rem 1.25rem 1.5rem;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  font-size: 0.88rem;
  border-top: 1px solid #1e293b;
  margin-top: 2.5rem;
}

.footer-container {
  max-width: 1280px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.footer-top-row {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.75rem;
  text-align: left;
}

.footer-brand {
  font-size: 0.95rem;
  color: #f8fafc;
}

.footer-attribution {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.4rem;
  color: #cbd5e1;
}

.attrib-title {
  font-weight: 700;
  color: #e2e8f0;
  font-size: 0.9rem;
}

.attrib-list {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  padding-left: 0.25rem;
}

.attrib-row {
  display: flex;
  align-items: center;
}

.footer-link {
  color: #38bdf8;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.15s ease;
}

.footer-link:hover {
  color: #7dd3fc;
  text-decoration: underline;
}

.footer-copy {
  font-size: 0.82rem;
  color: #94a3b8;
  text-align: center;
  width: 100%;
  padding-top: 0.75rem;
  border-top: 1px solid #1e293b;
}
</style>
