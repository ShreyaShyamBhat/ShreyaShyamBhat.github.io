// Provisional self-ratings. Edit the score on any skill here.
const skillGroups = {
  Backend: [
    { name: "Java", score: 5 },
    { name: "Spring Boot", score: 5 },
    { name: "REST APIs", score: 4 },
    { name: "GraphQL", score: 4 },
    { name: "Node.js", score: 3 }
  ],
  Frontend: [
    { name: "React", score: 4 },
    { name: "JavaScript", score: 4 },
    { name: "Redux", score: 4 },
    { name: "Tailwind CSS", score: 3 }
  ],
  "Data & Search": [
    { name: "Elasticsearch", score: 5 },
    { name: "Apache Kafka", score: 4 },
    { name: "RabbitMQ", score: 3 },
    { name: "PostgreSQL", score: 4 }
  ],
  "Cloud & DevOps": [
    { name: "AWS", score: 4 },
    { name: "Google Cloud", score: 3 },
    { name: "Docker", score: 4 },
    { name: "Kubernetes", score: 3 }
  ],
  AI: [
    { name: "OpenAI API", score: 4 },
    { name: "LangChain", score: 3 },
    { name: "Retrieval-augmented generation", score: 4 }
  ]
};

const projects = [
  {
    title: "Ask Questions Across PDFs",
    type: "Independent project",
    summary: "A document Q&A app that links answers back to the source pages.",
    stack: ["Python", "FastAPI", "React", "Elasticsearch"],
    details: [
      ["The problem", "Finding an answer in a long PDF is time-consuming. Even with a generated answer, readers need an easy way to check the source."],
      ["What I built", "I built an asynchronous PDF ingestion pipeline and a React interface that streams answers with **page-linked citations**. Redis stores context for follow-up questions."],
      ["How retrieval works", "Elasticsearch runs both **BM25 keyword search** and **vector search**. **Reciprocal rank fusion** combines the results, then an **LLM reranks** the top passages before answer generation. I evaluated retrieval and answer quality with Ragas."]
    ]
  },
  {
    title: "AI Query API",
    type: "Independent project",
    summary: "A Spring Boot API that handles rate limits and records query history asynchronously.",
    stack: ["Java", "Spring Boot", "Kafka", "PostgreSQL"],
    details: [
      ["The problem", "An API that calls an external model needs to handle rate limits and retain a useful query history."],
      ["What I built", "I integrated the OpenAI API with Spring WebClient, validated incoming requests, and used **exponential backoff** for rate-limit handling. Kafka handles **asynchronous metadata logging**, and PostgreSQL stores full query history."],
      ["How I verified it", "JUnit and Mockito tests covered the controller, service, and Kafka layers. I containerized the service and load-tested the Kubernetes deployment on Minikube with **health probes and autoscaling** configured."]
    ]
  },
  {
    title: "Enterprise Log Analysis",
    type: "Trellix case study",
    summary: "A Kafka and Elasticsearch pipeline for processing large archives and making logs searchable.",
    stack: ["Kafka", "Elasticsearch", "RabbitMQ", "Google Cloud"],
    details: [
      ["The problem", "The pipeline needed to process **more than 100 ZIP log files**, some up to 2 GB, while controlling memory usage."],
      ["What I built", "I deployed a **three-node Elasticsearch cluster** on Google Cloud. Kafka handled the pipeline, MongoDB stored data, and **parallel bulk inserts** indexed logs in Elasticsearch."],
      ["How I improved reliability", "I added RabbitMQ to **distribute work and control memory consumption**. That stabilized latency and eliminated timeouts and crashes in the pipeline."]
    ]
  }
];

function element(tag, value, className) {
  const node = document.createElement(tag);
  if (value) node.textContent = value;
  if (className) node.className = className;
  return node;
}

function tags(stack) {
  return stack.map(technology => element("span", technology, "tag"));
}

function projectParagraph(description) {
  const paragraph = element("p");
  description.split("**").forEach((part, index) => {
    paragraph.append(index % 2 ? element("strong", part) : part);
  });
  return paragraph;
}

const dialog = document.querySelector("#project-dialog");
const gallery = document.querySelector("#gallery");
let activeCard;

function openProject(project, card) {
  document.querySelector("#dialog-type").textContent = project.type;
  document.querySelector("#dialog-title").textContent = project.title;
  document.querySelector("#dialog-stack").replaceChildren(...tags(project.stack));
  document.querySelector("#dialog-details").replaceChildren(
    ...project.details.flatMap(([heading, description]) => [
      element("h3", heading),
      projectParagraph(description)
    ])
  );

  // Optional project fields: images: [{ src, alt }], demoUrl.
  const media = document.querySelector("#dialog-media");
  media.replaceChildren();
  for (const { src, alt } of project.images ?? []) {
    const image = element("img");
    image.src = src;
    image.alt = alt;
    image.loading = "lazy";
    media.append(image);
  }
  if (project.demoUrl) {
    const link = element("a", "Open demo ↗", "primary");
    link.href = project.demoUrl;
    media.append(link);
  }
  activeCard = card;
  dialog.scrollTop = 0;
  dialog.showModal();
}

dialog.addEventListener("close", () => activeCard?.focus({ preventScroll: true }));

for (const project of projects) {
  const card = element("button", "", "card");
  card.type = "button";
  card.setAttribute("aria-haspopup", "dialog");
  const stack = element("span", "", "tags");
  stack.append(...tags(project.stack));
  card.append(
    element("span", project.title, "card-title"),
    element("span", project.summary, "card-summary"),
    stack,
    element("span", "See details ↗", "card-link")
  );
  card.addEventListener("click", () => openProject(project, card));
  gallery.append(card);
}

const filters = document.querySelector(".filters");
const tables = document.querySelector("#skill-tables");
const skillStatus = document.querySelector("#skill-status");
let activeGroup = null;

function proficiency(score) {
  const meter = element("span", "", "proficiency");
  const segments = element("span", "", "segments");
  segments.setAttribute("aria-hidden", "true");
  for (let level = 1; level <= 5; level++) {
    segments.append(element("span", "", level <= score ? "filled" : ""));
  }
  meter.append(segments, element("span", score + "/5", "rating"));
  return meter;
}

function skillTable(group, skills) {
  const table = element("table");
  const head = element("thead");
  const header = element("tr");
  for (const label of ["Skill", "Proficiency"]) {
    const cell = element("th", label);
    cell.scope = "col";
    header.append(cell);
  }
  head.append(header);

  const body = element("tbody");
  for (const { name, score } of skills) {
    const row = element("tr");
    const value = element("td");
    value.append(proficiency(score));
    row.append(element("td", name), value);
    body.append(row);
  }

  table.append(element("caption", group), head, body);
  const shell = element("div", "", "table-shell");
  shell.append(table);
  return shell;
}

function renderSkills() {
  const groups = activeGroup ? [[activeGroup, skillGroups[activeGroup]]] : Object.entries(skillGroups);
  tables.replaceChildren(...groups.map(([group, skills]) => skillTable(group, skills)));
  const count = groups.reduce((total, [, skills]) => total + skills.length, 0);
  for (const button of filters.children) {
    button.setAttribute("aria-pressed", String(button.textContent === activeGroup));
  }
  skillStatus.textContent = activeGroup
    ? "Showing " + count + " skills in " + activeGroup
    : "Showing all " + count + " skills";
}

for (const group of Object.keys(skillGroups)) {
  const button = element("button", group);
  button.type = "button";
  button.addEventListener("click", () => {
    activeGroup = activeGroup === group ? null : group;
    renderSkills();
  });
  filters.append(button);
}

renderSkills();
