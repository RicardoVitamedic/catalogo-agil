# Catálogo Ágil

Plataforma SaaS para criação de catálogos digitais interativos — MVP pronto para deploy.  
Transforma PDFs em catálogos navegáveis com automação por IA (OCR + detecção de hotspots), integração com PIX, WhatsApp e ERPs brasileiros, tiles multi-resolução e SEO com SSR.

> Observação: este repositório contém um monorepo com frontend (Next.js), backend (FastAPI), worker (Celery) e infra (Terraform + exemplos Docker). Ideal para testes locais com Docker Compose ou deploy em ambiente cloud.

## Recursos principais

- Upload de PDF + planilha Excel com produtos
- Pipeline de processamento: pdftoppm → libvips (tiles) → OCR (Tesseract) → detecção de hotspots (YOLO)
- Armazenamento de assets em S3 + CDN (CloudFront)
- Viewer SSR (Next.js) com JSON-LD para SEO
- Checkout via WhatsApp, Webhook (ERP) e PIX (geração de código / QR)
- Analytics de eventos (page_view, hotspot_click, add_to_cart, checkout_start)
- Arquitetura projetada para escalabilidade (ECS / Lambda / RDS / ElastiCache)

## Estrutura do repositório

Raiz do projeto (resumido):

catalogo-agil/
- README.md
- docker-compose.yml
- Makefile
- .env.example
- backend/ (FastAPI)
  - app/
    - main.py, models/, api/, services/
- frontend/ (Next.js 14 + React 18 + TypeScript)
  - src/app, components, lib
- worker/ (Celery tasks para processamento)
  - tasks/pdf_processor.py, tile_generator.py, hotspot_detector.py
- infra/
  - terraform/, docker/nginx.conf

## Tecnologias

- Frontend: Next.js 14, React 18, TypeScript, TailwindCSS (SSR para SEO)
- Backend: Python 3.11, FastAPI, SQLAlchemy, Pydantic
- Processamento: Celery, Redis, libvips, pdftoppm, Tesseract OCR, YOLOv8, OpenCV, PyTorch
- Infra: AWS S3, CloudFront, PostgreSQL (RDS/Neon), Redis (ElastiCache), Docker, Terraform
- CI/CD / Deploy: containers (ECS / Vercel / Docker)

## Pré-requisitos (para desenvolvimento local)

- Docker & Docker Compose
- Node.js (se quiser rodar frontend sem Docker)
- Python 3.11 (se quiser rodar backend/worker sem Docker)
- (Opcional para IA) GPU + drivers CUDA, dependendo das implementações do YOLO/PyTorch

## Variáveis de ambiente importantes

Copie `.env.example` para `.env` e ajuste conforme necessário. Principais variáveis:

- DB_PASSWORD — senha do Postgres local (usado no docker-compose)
- AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY — credenciais AWS (para S3)
- S3_BUCKET — nome do bucket S3 (ex: catalogo-agil-assets)
- AWS_REGION — região AWS (ex: sa-east-1)
- CDN_URL — URL pública de tiles/CDN (ex: https://dxxxxx.cloudfront.net)
- NEXT_PUBLIC_API_URL — URL do backend para o frontend
- NEXT_PUBLIC_CDN_URL — URL base para tiles no viewer

## Rodando localmente (com Docker Compose) — recomendado

1. Clone o repositório:
   git clone https://github.com/RicardoVitamedic/catalogo-agil.git
   cd catalogo-agil

2. Crie `.env` a partir do `.env.example` e configure as variáveis (pelo menos DB_PASSWORD).

3. Inicie os serviços:
   docker-compose up --build

4. Acesse:
   - Frontend: http://localhost:3000
   - Backend (FastAPI): http://localhost:8000
   - Docs OpenAPI: http://localhost:8000/docs

Observação: o processamento de IA (YOLO/PyTorch) pode demandar configuração adicional se for usar aceleração por GPU. Localmente, o worker pode rodar em CPU.

## Desenvolvimento (run individualmente)

Backend (sem Docker):
- Crie venv e instale dependências:
  python -m venv .venv
  source .venv/bin/activate
  pip install -r backend/requirements.txt
- Execute:
  uvicorn app.main:app --reload --port 8000

Frontend (sem Docker):
- Entre na pasta frontend:
  cd frontend
  npm install
  npm run dev
- Acesse http://localhost:3000

Worker (Celery):
- Configure Redis e DB acessíveis
- Execute:
  celery -A worker worker --loglevel=info --concurrency=2

## Endpoints principais (exemplos)

- Health:
  GET / → status

- Upload de catálogo (cria build e inicia processamento):
  POST /api/v1/catalogs
  Form data: name (string), pdf_file (file .pdf), excel_file (opcional .xlsx)
  Retorna build_id e viewer_url.

- Metadata do catálogo (usado pelo viewer SSR):
  GET /api/v1/catalogs/{build_id}/metadata

- Criar pedido:
  POST /api/v1/orders
  payload JSON com itens e método de checkout (whatsapp, pix, webhook)

- Analytics:
  POST /api/v1/analytics/event

Exemplo curl (upload mínimo):
curl -X POST "http://localhost:8000/api/v1/catalogs" \
  -F "name=Meu Catalogo" \
  -F "pdf_file=@/caminho/para/catalogo.pdf"

Após envio, use o build_id retornado para abrir o viewer:
http://localhost:3000/catalog/{build_id}

## Considerações sobre IA e modelos

- O pipeline espera:
  - pdftoppm: converter páginas em imagens
  - libvips: gerar tiles multi-resolução
  - Tesseract OCR: extração de texto
  - YOLOv8 / PyTorch: detecção automática de hotspots (produtos na página)

Para produção, recomendo:
- Hospedar workers com GPU (se usar modelos pesados)
- Versionar modelos e isolar dependências (containers separados)
- Ajustar timeouts e retry das tasks Celery

## Deploy

Visão geral de deploy recomendado:
- Frontend: Vercel ou CDN+S3 (SSR via Vercel ou Edge Functions)
- Backend: ECS/Fargate ou Lambda (FastAPI via ASGI + API Gateway / ALB)
- Worker: ECS com tasks spot/EC2 (GPU para modelos) ou instâncias gerenciadas
- Banco: RDS (Postgres) ou Neon
- Cache/Filas: ElastiCache Redis
- Assets estáticos: S3 + CloudFront

Infraexemplos em /infra/terraform (ajustar variáveis e credenciais antes de aplicar).

## Roadmap (exemplos)

- [x] MVP: upload PDF → tiles → viewer SSR
- [x] Checkout via WhatsApp / webhook
- [ ] Integração nativa com Bling / Tiny / Omie
- [ ] Dashboard de analytics em tempo real
- [ ] Self-service onboarding / template de catalogo
- [ ] Otimizações de custo (spot + Lambdas híbridos)

## Contribuição

Contribuições são bem-vindas! Sugestões:
- Abra uma issue descrevendo o problema/feature
- Faça um fork, crie branch com feature/bugfix e envie PR
- Siga o padrão de lint e escreva testes quando aplicável

## Licença

Distribuído sob a licença MIT. Veja o arquivo LICENSE para detalhes.

## Contato

- Autor / Maintainer: Ricardo (https://github.com/RicardoVitamedic)  
Para dúvidas técnicas ou comerciais, abra uma issue ou entre em contato via GitHub.

---

Observações finais:
- Ajuste as variáveis AWS antes de rodar em produção.
- O processamento de IA pode requerer dependências nativas (libvips, tesseract, drivers CUDA) — veja os Dockerfiles das pastas `worker/` e `backend/` para detalhes de build.
