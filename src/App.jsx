import { useState, useEffect, useRef } from "react";

const STAGES = [
  { id: "interviewing", label: "面试中", color: "#F59E0B", emoji: "🎯" },
  { id: "offer", label: "已拿Offer", color: "#10B981", emoji: "🎉" },
  { id: "ended", label: "已结束", color: "#64748B", emoji: "📁" },
];

const PREP_LEVELS = [
  { value: 0, label: "未开始", color: "#9CA3AF" },
  { value: 1, label: "了解JD", color: "#F59E0B" },
  { value: 2, label: "已准备", color: "#3B82F6" },
  { value: 3, label: "充分准备", color: "#10B981" },
];

const SAMPLE_DATA = [
  {
    "id": "s1",
    "company": "MiniMax",
    "position": "AI架构师",
    "stage": "interviewing",
    "prepLevel": 2,
    "folderName": "minimax",
    "rounds": [
      { "name": "业务一面", "date": "2026-03-10", "time": "11:30", "status": "done", "emailLink": "https://vrfi1sk8a0.feishu.cn/hire/short_url/vtLLftnfSPE" },
      { "name": "技术二面", "date": "2026-03-17", "time": "11:00", "status": "done", "emailLink": "https://vrfi1sk8a0.feishu.cn/hire/short_url/xBvg3QRZkr8" },
      { "name": "海外业务面", "date": "2026-03-24", "time": "02:00", "status": "done", "emailLink": "https://vrfi1sk8a0.feishu.cn/hire/short_url/NTEq_mMv5Ug" }
    ],
    "jd": "1. 方案设计： 洞察行业机会点，将公司大模型技术、Agent框架转化为具备竞争力的商业化解决方案。需对方案的商业可行性、ROI及市场竞争力负责；\n2. 端到端交付： 负责AI项目从POC到正式交付的全生命周期管理。解决落地过程中的架构瓶颈，确保解决方案在商用场景下的性能达标；\n3. 产品闭环： 收集客户声音，反哺AI平台及大模型产品的规划与迭代，确保产品演进方向紧贴市场实战需求。\n职位要求\n1. 教育背景： 计算机、人工智能、数学等相关专业本科及以上学历；\n2. 落地经验： 具有1年以上AI项目实战落地经验，主导过2个以上大模型相关项目（如RAG知识库、Agent智能体工作流、多模态应用等）的商业化交付；\n3. 技术能力：\n- 精通大模型生态，能够进行Prompt工程优化、API调用能力、AI架构设计及Agent开发；有大模型项目研发、推理调优加速、知识库及agent 相关项目实战经验者优先；\n- 具备基础代码能力，能亲自上手进行核心原型Demo的编写与技术调优。\n4. 商业洞察：\n- 具备业务翻译能力，能将模糊的业务需求转化为清晰的技术架构；\n- 具备敏锐的商业嗅觉，能够评估技术方案的成本、周期与商业收益；\n- 客户沟通与影响力，能够在复杂的商业环境下驱动跨部门协作，具备极强的抗压能力和结果导向精神。",
    "notes": "准备反问问题",
    "createdAt": 1773862932307
  },
  {
    "id": "s2",
    "company": "智谱",
    "position": "大模型产品解决方案架构师",
    "stage": "interviewing",
    "prepLevel": 1,
    "folderName": "智谱",
    "rounds": [
      { "name": "业务leader面", "date": "2026-03-24", "time": "13:00", "status": "done", "emailLink": "https://vc.feishu.cn/j/240798299" }
    ],
    "jd": "大模型产品解决方案架构师-北京\n北京全职互联网 / 电子 / 网游\n职位描述\n1、深入理解大模型的原理和功能，负责向用户系统的讲述大模型的价值以及相关竞品；\n2、与客户沟通，深入挖掘业务场景，结合大模型的优化完成解决方案的设计；\n3、参与大模型技术选型评估、产品方案设计等工作，确保解决方案的质量和性能；\n4、负责解决方案的技术支持和问题解决，为客户提供高效的服务。\n职位要求\n1、有5年以上解决方案或项目经理相关工作经验，全日制本科或以上学历；\n2、有丰富的AI、云、大数据等行业解决方案经验，有金融&国央企&运营商&政府等行业经验；\n3、敏锐的商业意识，良好的客户需求分析、挖掘能力；\n4、有较强的业务模型分析能力、沟通能力和文档编写能力；\n5、具有良好的团队意识和合作精神，擅于协调与沟通。",
    "notes": "hr比较想要技术背景候选人\n智谱\n\n目前SA团队主要服务哪些行业的客户？最典型的项目类型是什么？\n OpenClaw带动了全球Token消耗的爆发，智谱刚发布了GLM-5-Turbo专门优化Agent场景。SA团队在推动企业级Agent落地这块，有没有新的方向或打法？**\n\n1. 结果；信息化，ai编程-古法coding-深度合作；组织coding agent定制化而不是做标品，卖人头不要；要么冷；\n2. 解法不是智能体，投人力；定制化；智能化；新进入行业，做定制；落地；\n3. 组织机构和协同机构；数字化和人结合；opc\n\n海淀，k12;\n\n\n\nai院和工程院；\n\n商业化交付；政企bd，业务不\n\n大型样过期，能源客户\n\n国际部，卖token；卖it基建；\n\n垂类，运营商，金融；\n小型客户，销售行为\n\n东南亚，中东'\n\n；沟通能力；编码模型，coding；研发团队；\n\n运营商和金融；\n\n冲劲的人；",
    "createdAt": 1773862932307
  },
  {
    "company": "蚂蚁",
    "position": "AI产品架构师-AI付",
    "stage": "ended",
    "prepLevel": 0,
    "folderName": "蚂蚁",
    "rounds": [
      { "name": "HR一面", "date": "2026-03-19", "time": "11:00", "status": "done", "emailLink": "蚂蚁集团 面试通知 (Ant Group interview notice)" },
      { "name": "HR二面", "date": "2026-03-20", "time": "10:00", "status": "done", "emailLink": "蚂蚁集团 面试通知 (Ant Group interview notice)" },
      { "name": "产品一面", "date": "2026-03-21", "time": "11:00", "status": "done", "emailLink": "蚂蚁集团 面试通知 (Ant Group interview notice)" },
      { "name": "HR面", "date": "2026-03-25", "time": "13:30", "status": "done", "emailLink": "蚂蚁集团面试通知 (Ant Group interview notice)" }
    ],
    "jd": "For AI 付，岗位包括但不限：\n1、Agent系统逻辑架构，深度设计 Agent 内部的运转流程；\n2、Skill与agent能力的封装；\n3、参与知识库与RAG构建；\n4、交互范式重构， 重新定义AI Native下的支付交互；\n5、商业与价值挖掘，探索与P端和B端的商业价值挖掘等。\n职位要求\n1、过往岗位和行业背景均不限；\n2、Agent深度玩家：对利用Agent逻辑重构支付流程有深刻见解，能定义Agent的决策边界；\n3、具备一定的产品和商业sense等。",
    "notes": "这一轮和hr聊完了，这个hr是很资深的那种，有点老板心腹的意思了；花名是笑笑；她看中的是我之前做交易的背景；但是她提出的核心问题，是我考虑用ai怎么做的点，集中于ai怎么在阿里整个生态上构建，包括千问，蚂蚁，飞猪，淘宝闪购等；但其实落实到这个具体的岗位上，他更关心agent如何在支付这个场景发力；也就是用户都已经选好了，如何在支付的层面落实这个agent呢？这个agent能有什么更多的应用呢？如何发掘P和B端的价值呢",
    "id": "mmwgsh6mmyp5g",
    "createdAt": 1773863941630
  },
  {
    "company": "baidu",
    "position": "Agent产品经理(数字员工方向)",
    "stage": "interviewing",
    "prepLevel": 0,
    "folderName": "baidu",
    "rounds": [
      { "name": "High Peer面", "date": "2026-03-20", "time": "11:00", "status": "done", "emailLink": "https://infoflow.baidu.com/meeting/invite?id=ee0c656e10b6a9be91fc58a5e182ab8e" }
    ],
    "jd": "-负责企业级数字员工平台核心产品设计，将大模型能力转化为可落地的业务生产力，打造具备感知、决策、执行能力的智能体产品\n-深入理解AI Agent行业及用户需求，打造面向不同行业的解决方案与行业智能体\n-负责产品全流程管理，从产品定义到上线，确保产品市场竞争力与用户体验卓越性\n-深入研究GPTs、智能体、Agents等前沿技术，探索其在不同行业的应用场景\n-洞察市场趋势，把握行业机会，持续关注AI领域最新动态、技术趋势和竞争对手情况，为产品规划提供决策依据\n职责要求：\n-3年以上产品经理经验，1 年以上大模型/Agent 相关实战经验。独立开发过 GPTs/智能体者优先\n-持续学习前沿的AI大模型领域的新技术，研究AI产品情况，探索AI业务应用新领域，有AI产品生命周期管理经验\n-具备极强的逻辑抽象能力，能够将非标的业务流程标准化、结构化，泛计算机类专业优先\n-加分项： 有 RPA（机器人流程自动化）、BPM（业务流程管理）经验者极佳",
    "notes": "",
    "id": "mmwgvl6ho3yu2",
    "createdAt": 1773864086777
  },
  {
    "company": "MSPbots",
    "position": "AI PM",
    "stage": "interviewing",
    "prepLevel": 0,
    "folderName": "MSPbots",
    "rounds": [
      { "name": "HR一面", "date": "2026-03-19", "time": "14:30", "status": "done", "emailLink": "https://teams.microsoft.com/meet/23150318663618?p=tSOEt2vyLNPbeoGr5d" },
      { "name": "产品一面", "date": "2026-03-25", "time": "15:00", "status": "done", "emailLink": "https://teams.microsoft.com/meet/28172832037887?p=iyJHvEC91HbMXai76W" }
    ],
    "jd": "职位：高级AI产品经理\n我们在找一位 能把 AI 真正做成产品、而不是只停留在概念层 的产品经理，一起把 AI 落地到真实业务和复杂场景中。\n\n你要做什么\n发现 AI 机会： 理解用户流程和业务痛点，判断哪些问题适合用 AI 解决\n做 AI 产品： 把业务问题转成 AI 产品方案，设计 MVP 并持续迭代\n设计 AI 功能： 与工程 / 数据团队一起定义输入输出、数据来源和效果标准\n跑实验、看结果： 通过数据和实验验证 AI 效果，持续优化准确率与体验\n推进交付： 协调研发上线 AI 功能，支持测试、文档和内部推广\n\n我们希望你具备\n2—6 年AI产品相关经验\n理解 AI 产品的基本原理（模型、Prompt、规则、数据依赖、评估方式等），不要求写代码\n擅长拆解复杂问题，能在不确定中快速迭代\n有数据意识，能用指标和实验驱动决策\n能和工程团队顺畅沟通，对新技术保持好奇",
    "notes": "",
    "id": "mmwmloqrg1irh",
    "createdAt": 1773873702531
  },
  {
    "company": "zoom",
    "position": "ai创新工具产品",
    "stage": "interviewing",
    "prepLevel": 0,
    "folderName": "zoom",
    "rounds": [
      { "name": "high peer一面", "date": "2026-03-24", "time": "10:00", "status": "done", "emailLink": "https://success.zoom.us/j/99342713076?pwd=dGJtkT2UZbMS0ZUWMsLcmv76ZGpPba.1" },
      { "name": "leader面", "date": "2026-03-31", "time": "06:30", "status": "scheduled", "emailLink": "https://success.zoom.us/j/97117600530?pwd=ZmecjQeebwQGqmW9Ca1ta80O3tQ5R1.1" }
    ],
    "jd": "负责创新协同办公产品某个核心产品模块的产品策划工作，主导并确保用户体验和用户增长目标的达成；zoom docs加zoom meeting的AI feature\n\n深入理解客户场景和业务诉求，带领产品、设计和研发团队，系统开展产品需求分析、方案设计和用户体验优化；\n\n构建并持续优化数据监控体系，深入分析产品数据，制定相应改进方案；\n\n与商业化团队保持紧密对接，深入理解客户需求并协助促成销售；\n\n持续丰富和完善产品方案，全面提升产品的市场竞争力与创新性。\n\n任职要求：\n统招本科及以上学历，具备 4年以上 互联网产品经验，计算机、设计等相关专业优先；\n能在工作中使用 英语 沟通和表达；\n对客户需求具有敏锐洞察力，善于把握用户体验，深入理解诉求本质；\n并能高效协调各方推动项目落地；\n拥有较强的开放性思维、自驱力和韧性，能在快节奏环境下独立开展工作并持续推进项目进展；\n思维逻辑清晰，善于分析问题本质，能够抽丝剥茧地探索需求背后的机会点，并提供系统性解决方案；\n热衷尝试各类办公效率工具和 AI 产品，对打造新一代办公协作类产品充满热情。\n\n加分项：\n有海外产品经验；\n有 AI 产品经验。",
    "notes": "",
    "id": "mmwzom6t8f864",
    "createdAt": 1773895674197
  },
  {
    "company": "boss直聘",
    "position": "ats产品经理",
    "stage": "interviewing",
    "prepLevel": 0,
    "folderName": "boss",
    "rounds": [
      { "name": "业务面", "date": "2026-03-20", "time": "14:00", "status": "done", "emailLink": "https://zpurl.cn/119v5WKmCYJ" }
    ],
    "jd": "负责 ATS系统（申请人追踪系统）的产品建设，能对产品的最终结果负责；\n负责考试系统和测评产品的规划、落地；\n能通过对业务侧需求的理解，找到问题的本质；\n能快速响应业务需求，高质量完成需求落地；\n能找到 AI和系统结合 的落地点，并能给出结果指标。\n\n【任职要求】：\n有互联网B端产品、ATS系统、人力招聘系统、考测系统经验者优先；\n善于拆解问题，能把复杂问题拆解落地；\n善于思考，保持好奇心。",
    "notes": "",
    "id": "mmx548szuzvx9",
    "createdAt": 1773904801427
  },
  {
    "company": "leapmind",
    "position": "AI产品经理",
    "stage": "interviewing",
    "prepLevel": 0,
    "folderName": "",
    "rounds": [
      { "name": "", "date": "2026-03-24", "time": "11:00", "status": "done", "emailLink": "" }
    ],
    "jd": "LeapMind 是一家技术驱动的，帮助客户做真实业务增长的 AI初创公司，目标是打造AI时代的全球数字化营销解决方案。",
    "notes": "",
    "id": "mmx8iz89ii742",
    "createdAt": 1773910527705
  },
  {
    "company": "高德",
    "position": "搜推体验-用户体验评测专家",
    "stage": "interviewing",
    "prepLevel": 0,
    "folderName": "高德",
    "rounds": [
      { "name": "业务一面", "date": "2026-03-30", "time": "11:00", "status": "scheduled", "emailLink": "https://mail.google.com/mail/u/0/#search/%E9%AB%98%E5%BE%B7/FMfcgzQgKvCSZhKCQDzkwtQvnZWRMGCV" }
    ],
    "jd": "负责高德地图搜索、内容评测体系，结合业务演进和发展，保障评测体系和数据牵引进度，有全局推动追踪能力，驱动体验效果。\n\n深入分析用户行为和市场趋势，识别用户需求，以创新的方式在前端展现和定义。\n\n紧密与底层数据/引擎/服务端协作，确保从数据采集、处理到展示的链路统一性和数据质量，推动数据驱动的产品决策。\n\n监控产品性能指标，如用户参与度、搜索准确率和推荐效果，定期进行优化和调整。\n\n对行业、竞品和新产品洞察分析，追踪最新的互联网技术，推动大模型自动化评测体系。\n\n职位要求：\n有专业深度的评测体系经验，具备大规模级产品生命周期管理经验。\n至少5年以上互联网产品经验，具有搜索评测产品经验和管理经验。\n精通数据分析，熟悉数据处理工具，对数据驱动的产品设计有深入理解。\n具备出色的项目管理能力，能够在多任务环境中有效安排优先级。",
    "notes": "",
    "id": "mmxyt44njnplo",
    "createdAt": 1773954670631
  },
  {
    "company": "抖音电商",
    "position": "标签产品经理",
    "stage": "interviewing",
    "prepLevel": 0,
    "folderName": "",
    "rounds": [
      { "name": "业务面", "date": "2026-03-27", "time": "11:00", "status": "scheduled", "emailLink": "https://t.zijieimg.com/Jb4dDbf5AwI/" }
    ],
    "jd": "1、负责抖音电商的用户标签和画像策略，负责搭建基础用户画像标签、兴趣体系标签、价值体系标签等，支持标签建设的AI方向，利用大模型对用户进行分类、上标，支持标签策略分析并协助业务落地；\n2、负责标签数据下钻及策略挖掘分析，结合抖音电商的核心业务目标，从人货场等多个维度，挖掘不同画像的用户特征并沉淀为标签资产，助力业务应用以实现增长；\n3、保障标签能力的可用性及完整性，和上下游团队合作，做好质量评估、数据接入并支持应用落地；\n4、提升平台工具的易用性和拓展能力，将标签能力和拓展落地到产品功能上，提升精细化运营的能力。\n职位要求\n1、有标签建设等产品经验，有标签准确性评估、追踪落地经验的为优先考虑，需要有中台工作经验、横向业务工作经验，有全面的用户视角topdown的思维方式；\n2、具备出色的数据分析和问题拆解能力，熟悉常用的数据统计和分析方法；\n3、对AI行业有好奇心，了解大模型，有大模型训练数据生产、评估经验者加分；\n4、有较强的跨部门沟通协作能力，能够创造良好的沟通氛围。",
    "notes": "",
    "id": "mmydwut13i92u",
    "createdAt": 1773980039413
  },
  {
    "company": "maxgent",
    "position": "agent产品经理",
    "stage": "interviewing",
    "prepLevel": 0,
    "folderName": "maxgent",
    "rounds": [
      { "name": "业务面", "date": "2026-03-25", "time": "11:00", "status": "done", "emailLink": "https://pcngni3nj9ss.feishu.cn/hire/short_url/NQhQhGJ7dKQ" }
    ],
    "jd": "田值openclaw方向的创业公司",
    "notes": "",
    "id": "mmyjti95xmwvg",
    "createdAt": 1773989960873
  },
  {
    "company": "TikTok",
    "position": "平台治理产品经理实习",
    "stage": "interviewing",
    "prepLevel": 0,
    "folderName": "tt",
    "rounds": [
      { "name": "面", "date": "2026-03-26", "time": "02:15", "status": "done", "emailLink": "https://t.zijieimg.com/p2jQ7yewEcI/" }
    ],
    "jd": "TikTok LIVE Ecosystem Governance - Product Manager Intern",
    "notes": "",
    "id": "mn2ldiiyq3o1q",
    "createdAt": 1774234438666
  },
  {
    "company": "商汤",
    "position": "大装置-技术产品经理",
    "stage": "interviewing",
    "prepLevel": 0,
    "folderName": "商汤",
    "rounds": [
      { "name": "一面", "date": "2026-03-23", "time": "14:00", "status": "done", "emailLink": "SenseTime商汤科技面试通知-来自于商汤科技" }
    ],
    "jd": "agent和rag",
    "notes": "",
    "id": "mn2mucyss6lc0",
    "createdAt": 1774236904228
  }
];

function gid() { return Date.now().toString(36) + Math.random().toString(36).substr(2, 5); }

// Beijing (UTC+8) → LA local time
function toLocal(dateStr, timeStr) {
  if (!dateStr || !timeStr) return { date: dateStr, time: timeStr };
  try {
    const d = new Date(`${dateStr}T${timeStr}:00+08:00`);
    return {
      date: d.toLocaleDateString("sv-SE", { timeZone: "America/Los_Angeles" }),
      time: d.toLocaleTimeString("en-GB", { timeZone: "America/Los_Angeles", hour: "2-digit", minute: "2-digit", hour12: false }),
    };
  } catch { return { date: dateStr, time: timeStr }; }
}

function fmtTime(dateStr, timeStr, local) {
  if (!local) return { date: dateStr, time: timeStr };
  return toLocal(dateStr, timeStr);
}

const DL = "~/Downloads";

let _drag = null;

export default function App() {
  const [items, setItems] = useState([]);
  const [ok, setOk] = useState(false);
  const [edit, setEdit] = useState(null);
  const [add, setAdd] = useState(false);
  const [q, setQ] = useState("");
  const [hover, setHover] = useState(null);
  const [local, setLocal] = useState(false);
  const [page, setPage] = useState("board"); // board | prep | book
  const [showData, setShowData] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    try {
      const r = localStorage.getItem("iv-v4");
      if (r) setItems(JSON.parse(r));
      else setItems(SAMPLE_DATA);
    } catch { setItems(SAMPLE_DATA); }
    setOk(true);
  }, []);

  useEffect(() => {
    if (!ok) return;
    try { localStorage.setItem("iv-v4", JSON.stringify(items)); } catch {}
  }, [items, ok]);

  const ins = (d) => { setItems((p) => [...p, { ...d, id: gid(), createdAt: Date.now() }]); setAdd(false); };
  const upd = (id, d) => setItems((p) => p.map((i) => (i.id === id ? { ...i, ...d } : i)));
  const del = (id) => { if (confirm("确定删除？")) { setItems((p) => p.filter((i) => i.id !== id)); setEdit(null); } };
  const mv = (id, s) => upd(id, { stage: s });
  const [showExport, setShowExport] = useState(false);
  const [exportCopied, setExportCopied] = useState(false);

  const exportJSON = () => JSON.stringify(items, null, 2);

  const handleExportCopy = () => {
    navigator.clipboard.writeText(exportJSON()).then(() => {
      setExportCopied(true);
      setTimeout(() => setExportCopied(false), 2000);
    });
  };

  const handleExportDownload = () => {
    try {
      const json = exportJSON();
      const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(json);
      const a = document.createElement("a");
      a.href = dataUri;
      a.download = `interview-data-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch { alert("下载失败，请使用复制功能"); }
  };

  const importData = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (Array.isArray(data)) {
          if (confirm(`将导入 ${data.length} 条面试记录，是否覆盖当前数据？\n（取消 = 合并追加）`)) {
            setItems(data);
          } else {
            const existIds = new Set(items.map((i) => i.id));
            const newItems = data.filter((d) => !existIds.has(d.id));
            setItems((p) => [...p, ...newItems]);
          }
        } else {
          alert("文件格式错误：需要 JSON 数组");
        }
      } catch { alert("JSON 解析失败，请检查文件内容"); }
      e.target.value = "";
      setShowData(false);
    };
    reader.readAsText(file);
  };

  const fl = items.filter((i) => i.company.toLowerCase().includes(q.toLowerCase()) || i.position.toLowerCase().includes(q.toLowerCase()));

  const soon = items
    .flatMap((i) => (i.rounds || []).filter((r) => r.status === "scheduled" && r.date).map((r) => ({ ...r, co: i.company, iid: i.id })))
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));

  if (!ok) return <div style={S.ld}><div style={S.sp} /></div>;

  return (
    <div style={S.app}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        *{box-sizing:border-box}
        ::-webkit-scrollbar{width:5px;height:5px}
        ::-webkit-scrollbar-thumb{background:#334155;border-radius:3px}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fi{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        @keyframes si{from{opacity:0;transform:scale(.97)}to{opacity:1;transform:scale(1)}}
        .crd:hover{border-color:#475569!important;transform:translateY(-2px);box-shadow:0 6px 20px rgba(0,0,0,.35)}
        .lb:hover{background:rgba(96,165,250,.18)!important}
        .drop-item:hover{background:#334155!important}
        input:focus,select:focus,textarea:focus{border-color:#3B82F6!important}
      `}</style>

      <header style={S.hd}>
        <div style={S.hl}>
          <h1 style={S.t}>🎯 面试追踪</h1>
          <div style={S.pageTabs}>
            <button style={{ ...S.pageTab, ...(page === "board" ? S.pageTabAct : {}) }} onClick={() => setPage("board")}>看板</button>
            <button style={{ ...S.pageTab, ...(page === "prep" ? S.pageTabAct : {}) }} onClick={() => setPage("prep")}>Mock 准备</button>
            <button style={{ ...S.pageTab, ...(page === "book" ? S.pageTabAct : {}) }} onClick={() => setPage("book")}>约面</button>
          </div>
          <span style={S.cnt}>{items.filter((i) => i.stage === "interviewing").length} 进行中</span>
        </div>
        <div style={S.hr}>
          <div style={S.sb}><span style={S.si}>⌕</span><input style={S.sin} placeholder="搜索..." value={q} onChange={(e) => setQ(e.target.value)} /></div>
          <button style={{ ...S.tzBtn, ...(local ? S.tzOn : {}) }} onClick={() => setLocal((v) => !v)}>
            🕐 {local ? "本地时间" : "北京时间"}
          </button>
          <div style={{ position: "relative" }}>
            <button style={S.dataBtn} onClick={() => setShowData((v) => !v)} title="数据管理">⚙️</button>
            {showData && (
              <>
                <div style={S.dropBg} onClick={() => setShowData(false)} />
                <div style={S.dropMenu}>
                  <div style={S.dropTitle}>数据管理</div>
                  <button className="drop-item" style={S.dropItem} onClick={() => { setShowData(false); setShowExport(true); }}>
                    <span>📥 导出 JSON</span>
                    <span style={S.dropHint}>{items.length} 条记录</span>
                  </button>
                  <button className="drop-item" style={S.dropItem} onClick={() => fileRef.current?.click()}>
                    <span>📤 导入 JSON</span>
                    <span style={S.dropHint}>覆盖或合并</span>
                  </button>
                  <input ref={fileRef} type="file" accept=".json" style={{ display: "none" }} onChange={importData} />
                  <div style={S.dropNote}>导出会下载包含所有面试数据的 JSON 文件，可用于备份和迁移</div>
                </div>
              </>
            )}
          </div>
          <button style={S.ab} onClick={() => setAdd(true)}>＋ 新增</button>
        </div>
      </header>

      {page === "board" && <>
      {soon.length > 0 && (
        <div style={S.ub}>
          <span style={S.ul}>⏰ 即将面试</span>
          <div style={S.ucs}>{soon.map((u, i) => {
            const t = fmtTime(u.date, u.time, local);
            return (
              <span key={i} style={S.uc} onClick={() => setEdit(u.iid)}><b>{u.co}</b> · {u.name} · {t.date} {t.time}</span>
            );
          })}</div>
        </div>
      )}

      <div style={S.bd}>
        {STAGES.map((st) => {
          const cs = fl.filter((i) => i.stage === st.id);
          return (
            <div key={st.id} style={{ ...S.cl, ...(hover === st.id ? S.clo : {}) }}
              onDragOver={(e) => { e.preventDefault(); setHover(st.id); }}
              onDragLeave={() => setHover(null)}
              onDrop={() => { if (_drag) mv(_drag, st.id); _drag = null; setHover(null); }}
            >
              <div style={S.ch}>
                <span style={{ ...S.dt, background: st.color }} />
                <span style={S.cn}>{st.emoji} {st.label}</span>
                <span style={S.cc}>{cs.length}</span>
              </div>
              <div style={S.cls}>
                {cs.map((it) => <Card key={it.id} it={it} local={local} onEdit={() => setEdit(it.id)} />)}
                {cs.length === 0 && <div style={S.emp}>拖拽卡片到这里</div>}
              </div>
            </div>
          );
        })}
      </div>
      </>}

      {page === "prep" && <PrepView items={items} local={local} />}
      {page === "book" && <BookingView items={items} />}

      {add && <AddM onClose={() => setAdd(false)} onSave={ins} />}
      {edit && <EditM item={items.find((i) => i.id === edit)} local={local} onClose={() => setEdit(null)} onSave={(d) => { upd(edit, d); setEdit(null); }} onDel={() => del(edit)} />}

      {showExport && (
        <Ov onClose={() => setShowExport(false)} wide>
          <h2 style={S.mt}>📥 导出数据</h2>
          <p style={{ fontSize: 13, color: "#94A3B8", margin: "0 0 14px" }}>
            共 {items.length} 条面试记录。复制下方 JSON 或下载为文件。
          </p>
          <div style={S.exportBtns}>
            <button style={S.copyBtnLg} onClick={handleExportCopy}>
              {exportCopied ? "✓ 已复制到剪贴板" : "📋 复制 JSON"}
            </button>
            <button style={S.dlBtnLg} onClick={handleExportDownload}>
              💾 下载 .json 文件
            </button>
          </div>
          <textarea
            readOnly
            style={S.exportBox}
            rows={12}
            value={exportJSON()}
            onClick={(e) => e.target.select()}
          />
          <div style={S.ma}>
            <button style={S.cb} onClick={() => setShowExport(false)}>关闭</button>
          </div>
        </Ov>
      )}
    </div>
  );
}

function Card({ it, local, onEdit }) {
  const nr = (it.rounds || []).find((r) => r.status === "scheduled");
  const pr = PREP_LEVELS[it.prepLevel || 0];
  const tot = (it.rounds || []).length;
  const dn = (it.rounds || []).filter((r) => r.status === "done").length;
  const nrt = nr ? fmtTime(nr.date, nr.time, local) : null;

  const folderHref = it.folderName ? `vscode://file${encodeURI(`/Users/fanyi/Downloads/${it.folderName}`)}` : null;

  return (
    <div className="crd" style={S.card} draggable onDragStart={() => { _drag = it.id; }} onClick={onEdit}>
      <div style={S.r1}>
        <span style={S.co}>{it.company}</span>
        <span style={{ ...S.pl, background: pr.color + "20", color: pr.color }}>{pr.label}</span>
      </div>
      <div style={S.ps}>{it.position}</div>
      <div style={S.lr}>
        {it.folderName && (
          <a className="lb" href={folderHref} onClick={(e) => e.stopPropagation()} style={S.lb} title={`VSCode → ${DL}/${it.folderName}`}>
            📂 文件
          </a>
        )}
        {nr?.emailLink && (
          <a className="lb" href={nr.emailLink} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} style={S.lb} title="打开邮件">
            ✉️ 邮件
          </a>
        )}
      </div>
      {nrt && <div style={S.nx}>📅 {nrt.date} {nrt.time} — {nr.name}{local ? <span style={S.tzTag}> PDT</span> : <span style={S.tzTag}> 北京</span>}</div>}
      {tot > 0 && (
        <div style={S.pr}>
          <div style={S.ds}>{(it.rounds || []).map((r, i) => (
            <span key={i} style={{ ...S.dts, background: r.status === "done" ? "#10B981" : r.status === "scheduled" ? "#F59E0B" : "#475569" }} />
          ))}</div>
          <span style={S.pt}>{dn}/{tot}</span>
        </div>
      )}
    </div>
  );
}

function AddM({ onClose, onSave }) {
  const [f, sf] = useState({ company: "", position: "", stage: "interviewing", prepLevel: 0, folderName: "", rounds: [{ name: "", date: "", time: "", status: "pending", emailLink: "" }], jd: "", notes: "" });
  const s = (k, v) => sf((p) => ({ ...p, [k]: v }));
  return (
    <Ov onClose={onClose}>
      <h2 style={S.mt}>新增面试</h2>
      <div style={S.g2}>
        <In label="公司" value={f.company} onChange={(v) => s("company", v)} autoFocus />
        <In label="职位" value={f.position} onChange={(v) => s("position", v)} />
      </div>
      <In label={`本地文件夹名（${DL}/...）`} value={f.folderName} onChange={(v) => s("folderName", v)} placeholder="minimax、智谱..." hint="卡片上会显示 📂 按钮，点击用 VSCode 打开" />
      <label style={S.la}>JD</label>
      <textarea style={S.ta} rows={3} value={f.jd} onChange={(e) => s("jd", e.target.value)} placeholder="粘贴职位描述..." />
      <div style={S.ma}>
        <button style={S.cb} onClick={onClose}>取消</button>
        <button style={{ ...S.svb, opacity: f.company && f.position ? 1 : .4 }} disabled={!f.company || !f.position} onClick={() => onSave(f)}>保存</button>
      </div>
    </Ov>
  );
}

function EditM({ item, local, onClose, onSave, onDel }) {
  const [f, sf] = useState({ ...item });
  const [tab, setTab] = useState("rounds");
  if (!item) return null;
  const s = (k, v) => sf((p) => ({ ...p, [k]: v }));
  const ar = () => s("rounds", [...(f.rounds || []), { name: "", date: "", time: "", status: "pending", emailLink: "" }]);
  const ur = (i, k, v) => { const r = [...(f.rounds || [])]; r[i] = { ...r[i], [k]: v }; s("rounds", r); };
  const dr = (i) => s("rounds", (f.rounds || []).filter((_, x) => x !== i));

  const folderHref = f.folderName ? `vscode://file${encodeURI(`/Users/fanyi/Downloads/${f.folderName}`)}` : null;

  return (
    <Ov onClose={onClose} wide>
      <div style={S.eh}>
        <div style={{ flex: 1 }}>
          <h2 style={S.mt}>{f.company}</h2>
          <span style={S.es}>{f.position}</span>
        </div>
        {f.folderName && <a className="lb" href={folderHref} style={S.hl2}>📂 打开文件夹</a>}
        <button style={S.db} onClick={onDel}>🗑</button>
      </div>

      <div style={S.ts}>{[["rounds", "面试轮次"], ["info", "基本信息"], ["jd", "JD / 笔记"]].map(([id, l]) => (
        <button key={id} style={{ ...S.tb, ...(tab === id ? S.ta2 : {}) }} onClick={() => setTab(id)}>{l}</button>
      ))}</div>

      {tab === "rounds" && (
        <div style={S.tc}>
          {(f.rounds || []).length === 0 && <div style={S.eh2}>点击下方添加面试轮次</div>}
          {(f.rounds || []).map((r, i) => (
            <div key={i} style={S.rc}>
              <div style={S.rt}>
                <span style={S.rn}>第 {i + 1} 轮</span>
                <select style={{ ...S.ss, color: r.status === "done" ? "#10B981" : r.status === "scheduled" ? "#F59E0B" : "#94A3B8" }} value={r.status} onChange={(e) => ur(i, "status", e.target.value)}>
                  <option value="pending">⏳ 待定</option>
                  <option value="scheduled">📅 已排期</option>
                  <option value="done">✅ 已完成</option>
                </select>
                <button style={S.rd} onClick={() => dr(i)}>✕</button>
              </div>
              <div style={S.rf}>
                <input style={{ ...S.inp, flex: 2 }} placeholder="轮次名称（技术一面…）" value={r.name} onChange={(e) => ur(i, "name", e.target.value)} />
                <input style={{ ...S.inp, flex: 1 }} type="date" value={r.date} onChange={(e) => ur(i, "date", e.target.value)} />
                <input style={{ ...S.inp, flex: .6 }} type="time" value={r.time} onChange={(e) => ur(i, "time", e.target.value)} />
              </div>
              {local && r.date && r.time && (() => { const cv = toLocal(r.date, r.time); return (
                <div style={S.localHint}>🕐 本地时间：{cv.date} {cv.time} PDT</div>
              ); })()}
              <div style={S.er}>
                <span style={{ fontSize: 13, flexShrink: 0 }}>✉️</span>
                <input style={{ ...S.inp, flex: 1 }} placeholder="粘贴面试邮件链接..." value={r.emailLink || ""} onChange={(e) => ur(i, "emailLink", e.target.value)} />
                {r.emailLink && <a className="lb" href={r.emailLink} target="_blank" rel="noreferrer" style={S.gl}>打开 ↗</a>}
              </div>
            </div>
          ))}
          <button style={S.arb} onClick={ar}>＋ 添加轮次</button>
        </div>
      )}

      {tab === "info" && (
        <div style={S.tc}>
          <div style={S.g2}>
            <In label="公司" value={f.company} onChange={(v) => s("company", v)} />
            <In label="职位" value={f.position} onChange={(v) => s("position", v)} />
          </div>
          <In label={`文件夹名（${DL}/...）`} value={f.folderName || ""} onChange={(v) => s("folderName", v)} placeholder="minimax、智谱..." />
          <div><label style={S.la}>阶段</label><select style={S.sel} value={f.stage} onChange={(e) => s("stage", e.target.value)}>{STAGES.map((st) => <option key={st.id} value={st.id}>{st.emoji} {st.label}</option>)}</select></div>
          <label style={{ ...S.la, marginTop: 12 }}>准备程度</label>
          <div style={S.prw}>{PREP_LEVELS.map((p) => (
            <button key={p.value} style={{ ...S.pb, background: f.prepLevel === p.value ? p.color + "20" : "transparent", borderColor: f.prepLevel === p.value ? p.color : "#334155", color: f.prepLevel === p.value ? p.color : "#64748B" }} onClick={() => s("prepLevel", p.value)}>{p.label}</button>
          ))}</div>
        </div>
      )}

      {tab === "jd" && (
        <div style={S.tc}>
          <label style={S.la}>JD / 职位描述</label>
          <textarea style={S.ta} rows={6} value={f.jd || ""} onChange={(e) => s("jd", e.target.value)} placeholder="粘贴完整 JD..." />
          <label style={{ ...S.la, marginTop: 14 }}>备注 & 复盘</label>
          <textarea style={S.ta} rows={4} value={f.notes || ""} onChange={(e) => s("notes", e.target.value)} placeholder="面试问题、复盘笔记..." />
        </div>
      )}

      <div style={S.ma}>
        <button style={S.cb} onClick={onClose}>取消</button>
        <button style={S.svb} onClick={() => onSave(f)}>保存修改</button>
      </div>
    </Ov>
  );
}

/* ── 约面 Booking View ── */
function BookingView({ items }) {
  const [startH, setStartH] = useState(9);
  const [endH, setEndH] = useState(15);
  const [days, setDays] = useState(14);
  const [includeWeekend, setIncWeekend] = useState(false);
  const [slotMin, setSlotMin] = useState(60);
  const [excluded, setExcluded] = useState(new Set());
  const [included, setIncluded] = useState(new Set());
  const [copied, setCopied] = useState(false);
  const [lang, setLang] = useState("cn");
  // Publish & bookings state
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [showBookings, setShowBookings] = useState(false);

  const getAdminToken = () => {
    let token = localStorage.getItem("admin-token");
    if (!token) {
      token = prompt("请输入 Admin Token（在 Vercel 环境变量中设置的 ADMIN_TOKEN）：");
      if (token) localStorage.setItem("admin-token", token);
    }
    return token;
  };

  const handlePublish = async () => {
    const token = getAdminToken();
    if (!token) return;
    setPublishing(true);
    try {
      // Collect all available slots from the current grid
      const availSlots = [];
      allDates.forEach(({ date }) => {
        getSlots(date).forEach((s) => {
          if (s.available) {
            availSlots.push({ date, start_min: s.startMin, duration_min: slotMin });
          }
        });
      });
      const r = await fetch("/api/slots", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ slots: availSlots }),
      });
      if (r.ok) {
        setPublished(true);
        setTimeout(() => setPublished(false), 3000);
      } else {
        const d = await r.json();
        alert(d.error || "Publish failed");
        if (r.status === 401) localStorage.removeItem("admin-token");
      }
    } catch { alert("Network error"); }
    setPublishing(false);
  };

  const loadBookings = async () => {
    const token = getAdminToken();
    if (!token) return;
    setLoadingBookings(true);
    setShowBookings(true);
    try {
      const r = await fetch("/api/bookings", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (r.ok) {
        const d = await r.json();
        setBookings(d.bookings || []);
      } else {
        if (r.status === 401) localStorage.removeItem("admin-token");
        alert("Failed to load bookings");
      }
    } catch { alert("Network error"); }
    setLoadingBookings(false);
  };

  const WEEKDAYS_CN = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
  const WEEKDAYS_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const occupied = [];
  items.forEach((it) => {
    (it.rounds || []).forEach((r) => {
      if (r.status === "scheduled" && r.date && r.time) {
        const [h, m] = r.time.split(":").map(Number);
        occupied.push({ date: r.date, startMin: h * 60 + m, endMin: h * 60 + m + 60, company: it.company, name: r.name });
      }
    });
  });

  const isOccupied = (dateStr, slotStartMin) => {
    const slotEnd = slotStartMin + slotMin;
    return occupied.find((o) => o.date === dateStr && slotStartMin < o.endMin && slotEnd > o.startMin);
  };

  const allDates = [];
  const today = new Date();
  for (let d = 1; d <= days; d++) {
    const dt = new Date(today);
    dt.setDate(today.getDate() + d);
    const dow = dt.getDay();
    if (!includeWeekend && (dow === 0 || dow === 6)) continue;
    const ds = dt.toLocaleDateString("sv-SE");
    allDates.push({ date: ds, dow, dateObj: dt });
  }

  const getSlots = (dateStr) => {
    const slots = [];
    for (let m = startH * 60; m < endH * 60; m += slotMin) {
      const key = `${dateStr}-${m}`;
      const occ = isOccupied(dateStr, m);
      const blocked = !!occ;
      const manualOff = excluded.has(key);
      const manualOn = included.has(key);
      const available = blocked ? manualOn : !manualOff;
      slots.push({
        key,
        startMin: m,
        startStr: `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`,
        endStr: `${String(Math.floor((m + slotMin) / 60)).padStart(2, "0")}:${String((m + slotMin) % 60).padStart(2, "0")}`,
        occupied: occ,
        blocked,
        available,
      });
    }
    return slots;
  };

  const toggleSlot = (key, blocked) => {
    if (blocked) {
      const n = new Set(included);
      n.has(key) ? n.delete(key) : n.add(key);
      setIncluded(n);
    } else {
      const n = new Set(excluded);
      n.has(key) ? n.delete(key) : n.add(key);
      setExcluded(n);
    }
  };

  const bjtToPdt = (dateStr, timeStr) => {
    try {
      const d = new Date(`${dateStr}T${timeStr}:00+08:00`);
      return {
        date: d.toLocaleDateString("sv-SE", { timeZone: "America/Los_Angeles" }),
        time: d.toLocaleTimeString("en-GB", { timeZone: "America/Los_Angeles", hour: "2-digit", minute: "2-digit", hour12: false }),
      };
    } catch { return { date: dateStr, time: timeStr }; }
  };

  const buildText = () => {
    const lines = [];
    if (lang === "cn") {
      lines.push("您好，以下是我近期可面试的时间段（北京时间）：\n");
    } else {
      lines.push("Hi, below are my available interview slots (Beijing Time):\n");
    }

    allDates.forEach(({ date, dow, dateObj }) => {
      const slots = getSlots(date).filter((s) => s.available);
      if (slots.length === 0) return;
      const mm = dateObj.getMonth() + 1;
      const dd = dateObj.getDate();
      const wdLabel = lang === "cn" ? WEEKDAYS_CN[dow] : WEEKDAYS_EN[dow];

      if (lang === "cn") {
        lines.push(`📅 ${mm}月${dd}日 ${wdLabel}`);
      } else {
        lines.push(`📅 ${date} (${wdLabel})`);
      }
      slots.forEach((s) => {
        const pdt1 = bjtToPdt(date, s.startStr);
        const pdt2 = bjtToPdt(date, s.endStr);
        if (lang === "cn") {
          lines.push(`  · ${s.startStr}-${s.endStr}（加州时间 ${pdt1.date.slice(5)} ${pdt1.time}-${pdt2.time}）`);
        } else {
          lines.push(`  · ${s.startStr}-${s.endStr} BJT (${pdt1.time}-${pdt2.time} PDT, ${pdt1.date})`);
        }
      });
      lines.push("");
    });

    if (lang === "cn") {
      lines.push("如以上时间不便，欢迎告知其他偏好，谢谢！");
    } else {
      lines.push("Please let me know if none of these work. Happy to accommodate other times. Thanks!");
    }
    return lines.join("\n");
  };

  const totalAvail = allDates.reduce((sum, { date }) => sum + getSlots(date).filter((s) => s.available).length, 0);

  const handleCopy = () => {
    navigator.clipboard.writeText(buildText()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div style={S.bkWrap}>
      <div style={S.bkHeader}>
        <div>
          <h2 style={S.prepTitle}>📆 约面时间</h2>
          <span style={S.prepSub}>根据已有面试自动排除冲突，生成可约时间段发给猎头</span>
        </div>
        <div style={S.prepActions}>
          <div style={S.langToggle}>
            <button style={{ ...S.langBtn, ...(lang === "cn" ? S.langAct : {}) }} onClick={() => setLang("cn")}>中文</button>
            <button style={{ ...S.langBtn, ...(lang === "en" ? S.langAct : {}) }} onClick={() => setLang("en")}>EN</button>
          </div>
          <span style={S.selCount}>{totalAvail} 个可用时段</span>
          <button style={{ ...S.copyBtnLg, ...(copied ? { background: "#10B98122", borderColor: "#10B981", color: "#10B981" } : {}) }} onClick={handleCopy}>
            {copied ? "✓ 已复制" : "📋 复制发给猎头"}
          </button>
          <button
            style={{ ...S.publishBtn, ...(published ? { background: "#10B98122", borderColor: "#10B981", color: "#10B981" } : {}) }}
            onClick={handlePublish}
            disabled={publishing}
          >
            {publishing ? "⏳ 发布中..." : published ? "✓ 已发布" : "🚀 发布到预约页"}
          </button>
          <button style={S.bookingsBtn} onClick={loadBookings}>
            📋 查看预约
          </button>
        </div>
      </div>

      <div style={S.bkSettings}>
        <div style={S.bkSetItem}>
          <label style={S.la}>北京时间范围</label>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <select style={{ ...S.sel, width: 75 }} value={startH} onChange={(e) => setStartH(+e.target.value)}>
              {Array.from({ length: 24 }, (_, i) => <option key={i} value={i}>{String(i).padStart(2, "0")}:00</option>)}
            </select>
            <span style={{ color: "#475569" }}>—</span>
            <select style={{ ...S.sel, width: 75 }} value={endH} onChange={(e) => setEndH(+e.target.value)}>
              {Array.from({ length: 24 }, (_, i) => <option key={i} value={i}>{String(i).padStart(2, "0")}:00</option>)}
            </select>
          </div>
        </div>
        <div style={S.bkSetItem}>
          <label style={S.la}>每段时长</label>
          <select style={{ ...S.sel, width: 90 }} value={slotMin} onChange={(e) => setSlotMin(+e.target.value)}>
            <option value={30}>30 分钟</option>
            <option value={45}>45 分钟</option>
            <option value={60}>1 小时</option>
            <option value={90}>1.5 小时</option>
          </select>
        </div>
        <div style={S.bkSetItem}>
          <label style={S.la}>展望天数</label>
          <select style={{ ...S.sel, width: 75 }} value={days} onChange={(e) => setDays(+e.target.value)}>
            <option value={7}>7 天</option>
            <option value={14}>14 天</option>
            <option value={21}>21 天</option>
          </select>
        </div>
        <div style={S.bkSetItem}>
          <label style={S.la}>包含周末</label>
          <button
            style={{ ...S.wkBtn, ...(includeWeekend ? S.wkOn : {}) }}
            onClick={() => setIncWeekend((v) => !v)}
          >{includeWeekend ? "✓ 是" : "✕ 否"}</button>
        </div>
      </div>

      <div style={S.bkGrid}>
        {allDates.map(({ date, dow, dateObj }) => {
          const slots = getSlots(date);
          const mm = dateObj.getMonth() + 1;
          const dd = dateObj.getDate();
          const availCount = slots.filter((s) => s.available).length;
          return (
            <div key={date} style={S.bkDay}>
              <div style={S.bkDayHead}>
                <span style={S.bkDate}>{mm}/{dd}</span>
                <span style={S.bkDow}>{WEEKDAYS_CN[dow]}</span>
                <span style={S.bkAvail}>{availCount}/{slots.length}</span>
              </div>
              <div style={S.bkSlots}>
                {slots.map((s) => (
                  <button
                    key={s.key}
                    style={{
                      ...S.bkSlot,
                      ...(s.available ? S.bkSlotOn : S.bkSlotOff),
                      ...(s.blocked && !s.available ? S.bkSlotOcc : {}),
                    }}
                    onClick={() => toggleSlot(s.key, s.blocked)}
                    title={s.blocked ? "已占用，点击强制可用" : s.available ? "点击排除" : "点击恢复"}
                  >
                    <span style={S.bkSlotTime}>{s.startStr}</span>
                    {s.blocked && !s.available && <span style={S.bkSlotTag}>🔒 已占用</span>}
                    {s.blocked && s.available && <span style={S.bkSlotTag}>⚡ 已覆盖</span>}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div style={S.previewWrap}>
        <div style={S.previewHead}>
          <span style={S.previewLabel}>📤 发送预览</span>
          <span style={S.previewCount}>{totalAvail} 个时段 · {lang === "cn" ? "中文" : "English"}</span>
        </div>
        <pre style={S.previewBox}>{buildText()}</pre>
      </div>

      {/* Published link hint */}
      {published && (
        <div style={S.publishHint}>
          ✅ 时间段已发布！把下面链接发给猎头即可预约：
          <div style={S.publishLink}>
            <code>{window.location.origin}/book</code>
            <button style={S.copySmBtn} onClick={() => { navigator.clipboard.writeText(window.location.origin + "/book"); }}>复制</button>
          </div>
        </div>
      )}

      {/* Bookings panel */}
      {showBookings && (
        <div style={S.previewWrap}>
          <div style={S.previewHead}>
            <span style={S.previewLabel}>📋 已收到的预约</span>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span style={S.previewCount}>{bookings.length} 条</span>
              <button style={S.refreshBtn} onClick={loadBookings}>🔄</button>
              <button style={S.refreshBtn} onClick={() => setShowBookings(false)}>✕</button>
            </div>
          </div>
          {loadingBookings && <div style={{ padding: 20, textAlign: "center", color: "#64748B" }}>加载中...</div>}
          {!loadingBookings && bookings.length === 0 && <div style={{ padding: 20, textAlign: "center", color: "#64748B" }}>暂无预约</div>}
          {!loadingBookings && bookings.map((b, i) => {
            const startH = String(Math.floor(b.start_min / 60)).padStart(2, "0");
            const startM = String(b.start_min % 60).padStart(2, "0");
            return (
              <div key={i} style={S.bookingRow}>
                <div style={S.bookingMain}>
                  <span style={S.bookingDate}>📅 {b.date} {startH}:{startM} BJT</span>
                  <span style={S.bookingName}>{b.booker_name}</span>
                  {b.booker_company && <span style={S.bookingCompany}>@ {b.booker_company}</span>}
                </div>
                <div style={S.bookingMeta}>
                  {b.booker_position && <span>💼 {b.booker_position}</span>}
                  <a href={`mailto:${b.booker_email}`} style={S.bookingEmail}>✉️ {b.booker_email}</a>
                  {b.notes && <span style={S.bookingNotes}>📝 {b.notes}</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── Mock 准备 View ── */
function PrepView({ items, local }) {
  const [sel, setSel] = useState(new Set());
  const [copied, setCopied] = useState(false);

  const upcoming = items
    .filter((i) => i.stage === "interviewing")
    .map((i) => {
      const nextRound = (i.rounds || []).find((r) => r.status === "scheduled" && r.date);
      const allScheduled = (i.rounds || []).filter((r) => r.status === "scheduled" && r.date);
      return { ...i, nextRound, allScheduled };
    })
    .sort((a, b) => {
      const ad = a.nextRound ? a.nextRound.date + a.nextRound.time : "9999";
      const bd = b.nextRound ? b.nextRound.date + b.nextRound.time : "9999";
      return ad.localeCompare(bd);
    });

  const toggleAll = () => {
    if (sel.size === upcoming.length) setSel(new Set());
    else setSel(new Set(upcoming.map((i) => i.id)));
  };
  const toggle = (id) => {
    const n = new Set(sel);
    n.has(id) ? n.delete(id) : n.add(id);
    setSel(n);
  };

  const buildExport = () => {
    const selected = upcoming.filter((i) => sel.has(i.id));
    const divider = "═".repeat(50);

    return selected.map((it) => {
      const rounds = (it.allScheduled || []).map((r) => {
        const t = local ? toLocal(r.date, r.time) : { date: r.date, time: r.time };
        return `  · ${r.name}：${t.date} ${t.time}${local ? " (PDT)" : " (北京时间)"}`;
      }).join("\n");

      return [
        divider,
        `🏢 公司：${it.company}`,
        `💼 岗位：${it.position}`,
        `📂 本地文件：/Users/fanyi/Downloads/${it.folderName || "(未设置)"}`,
        rounds ? `📅 面试安排：\n${rounds}` : "📅 面试安排：暂无排期",
        it.jd ? `\n📋 JD：\n${it.jd}` : "📋 JD：（未填写）",
        divider,
      ].join("\n");
    }).join("\n\n");
  };

  const handleCopy = () => {
    const text = buildExport();
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDownload = () => {
    const text = buildExport();
    if (!text) return;
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mock-prep-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={S.prepWrap}>
      <div style={S.prepHeader}>
        <div>
          <h2 style={S.prepTitle}>📝 Mock 准备</h2>
          <span style={S.prepSub}>勾选即将面试的公司，导出信息用于 Mock 练习</span>
        </div>
        <div style={S.prepActions}>
          <span style={S.selCount}>{sel.size}/{upcoming.length} 已选</span>
          <button style={S.copyBtn} onClick={handleCopy} disabled={sel.size === 0}>
            {copied ? "✓ 已复制" : "📋 复制到剪贴板"}
          </button>
          <button style={{ ...S.dlBtn, opacity: sel.size > 0 ? 1 : 0.4 }} onClick={handleDownload} disabled={sel.size === 0}>
            💾 导出 .txt
          </button>
        </div>
      </div>

      <div style={S.prepTable}>
        <div style={S.prepRow0}>
          <div style={S.prepCk} onClick={toggleAll}>
            <span style={sel.size === upcoming.length && upcoming.length > 0 ? S.ckOn : S.ckOff}>
              {sel.size === upcoming.length && upcoming.length > 0 ? "☑" : "☐"}
            </span>
          </div>
          <span style={{ ...S.prepTh, flex: 1.5 }}>公司</span>
          <span style={{ ...S.prepTh, flex: 2 }}>岗位</span>
          <span style={{ ...S.prepTh, flex: 2 }}>下一轮面试</span>
          <span style={{ ...S.prepTh, flex: 1.2 }}>准备状态</span>
          <span style={{ ...S.prepTh, flex: 1.2 }}>文件夹</span>
        </div>

        {upcoming.length === 0 && <div style={S.prepEmpty}>暂无面试中的公司</div>}

        {upcoming.map((it) => {
          const checked = sel.has(it.id);
          const prep = PREP_LEVELS[it.prepLevel || 0];
          const nr = it.nextRound;
          const nrt = nr ? fmtTime(nr.date, nr.time, local) : null;
          return (
            <div key={it.id} style={{ ...S.prepRowItem, ...(checked ? S.prepRowSel : {}) }} onClick={() => toggle(it.id)}>
              <div style={S.prepCk}>
                <span style={checked ? S.ckOn : S.ckOff}>{checked ? "☑" : "☐"}</span>
              </div>
              <div style={{ flex: 1.5 }}>
                <div style={S.prepCo}>{it.company}</div>
              </div>
              <div style={{ flex: 2 }}>
                <div style={S.prepPos}>{it.position}</div>
              </div>
              <div style={{ flex: 2 }}>
                {nrt ? (
                  <div style={S.prepTime}>
                    📅 {nrt.date} {nrt.time} — {nr.name}
                    {local && <span style={S.tzTag}> PDT</span>}
                  </div>
                ) : <span style={S.prepNa}>—</span>}
              </div>
              <div style={{ flex: 1.2 }}>
                <span style={{ ...S.pl, background: prep.color + "20", color: prep.color }}>{prep.label}</span>
              </div>
              <div style={{ flex: 1.2 }}>
                {it.folderName ? (
                  <a
                    className="lb"
                    href={`vscode://file${encodeURI(`/Users/fanyi/Downloads/${it.folderName}`)}`}
                    onClick={(e) => e.stopPropagation()}
                    style={S.lb}
                  >📂 {it.folderName}</a>
                ) : <span style={S.prepNa}>未设置</span>}
              </div>
            </div>
          );
        })}
      </div>

      {sel.size > 0 && (
        <div style={S.previewWrap}>
          <div style={S.previewHead}>
            <span style={S.previewLabel}>📄 导出预览</span>
            <span style={S.previewCount}>{sel.size} 个公司</span>
          </div>
          <pre style={S.previewBox}>{buildExport()}</pre>
        </div>
      )}
    </div>
  );
}

function Ov({ children, onClose, wide }) {
  return (
    <div style={S.ov} onClick={onClose}>
      <div style={{ ...S.md, ...(wide ? { maxWidth: 680 } : {}) }} onClick={(e) => e.stopPropagation()}>{children}</div>
    </div>
  );
}

function In({ label, value, onChange, placeholder, hint, autoFocus }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={S.la}>{label}</label>
      <input style={S.inp} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder || ""} autoFocus={autoFocus} />
      {hint && <div style={S.ht}>{hint}</div>}
    </div>
  );
}

const ff = "'DM Sans',system-ui,-apple-system,sans-serif";
const S = {
  app: { fontFamily: ff, minHeight: "100vh", background: "linear-gradient(160deg,#0c1222,#162032 50%,#0f1a2e)", color: "#E2E8F0", paddingBottom: 40 },
  ld: { display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" },
  sp: { width: 28, height: 28, border: "3px solid #1e293b", borderTopColor: "#3B82F6", borderRadius: "50%", animation: "spin .7s linear infinite" },
  hd: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 22px", borderBottom: "1px solid #1e293b55", background: "rgba(12,18,34,.85)", backdropFilter: "blur(16px)", position: "sticky", top: 0, zIndex: 50, gap: 12, flexWrap: "wrap" },
  hl: { display: "flex", alignItems: "center", gap: 10 },
  hr: { display: "flex", alignItems: "center", gap: 10 },
  t: { margin: 0, fontSize: 18, fontWeight: 700, color: "#F1F5F9", letterSpacing: "-.02em" },
  cnt: { fontSize: 11, padding: "3px 10px", borderRadius: 20, background: "#F59E0B18", color: "#F59E0B", fontWeight: 600 },
  sb: { position: "relative" },
  si: { position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", color: "#475569", fontSize: 15 },
  sin: { background: "#1e293b", border: "1px solid #334155", borderRadius: 8, padding: "7px 10px 7px 28", color: "#E2E8F0", fontSize: 13, outline: "none", width: 150, fontFamily: ff },
  ab: { background: "linear-gradient(135deg,#3B82F6,#6366F1)", border: "none", borderRadius: 8, color: "#fff", padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: ff, boxShadow: "0 2px 10px #3B82F633" },
  tzBtn: { background: "#1e293b", border: "1px solid #334155", borderRadius: 8, color: "#94A3B8", padding: "7px 12px", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: ff, transition: "all .15s", whiteSpace: "nowrap" },
  tzOn: { background: "#3B82F618", borderColor: "#3B82F6", color: "#60A5FA" },
  dataBtn: { background: "#1e293b", border: "1px solid #334155", borderRadius: 8, color: "#94A3B8", padding: "7px 10px", fontSize: 14, cursor: "pointer", transition: "all .15s", lineHeight: 1 },
  dropBg: { position: "fixed", inset: 0, zIndex: 60 },
  dropMenu: { position: "absolute", right: 0, top: "calc(100% + 6px)", background: "#1a2744", border: "1px solid #2a3a55", borderRadius: 12, padding: "6px", minWidth: 240, zIndex: 61, boxShadow: "0 12px 36px rgba(0,0,0,.5)", animation: "fi .15s ease" },
  dropTitle: { fontSize: 11, fontWeight: 700, color: "#64748B", padding: "8px 12px 4px", textTransform: "uppercase", letterSpacing: ".04em" },
  dropItem: { display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", background: "transparent", border: "none", borderRadius: 8, padding: "10px 12px", color: "#E2E8F0", fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: ff, transition: "background .12s", textAlign: "left" },
  dropHint: { fontSize: 11, color: "#475569" },
  dropNote: { fontSize: 10, color: "#475569", padding: "8px 12px", lineHeight: 1.5, borderTop: "1px solid #1e293b" },
  exportBtns: { display: "flex", gap: 8, marginBottom: 12 },
  copyBtnLg: { flex: 1, background: "#1e293b", border: "1px solid #334155", borderRadius: 8, color: "#E2E8F0", padding: "10px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: ff, transition: "all .15s" },
  dlBtnLg: { flex: 1, background: "linear-gradient(135deg,#3B82F6,#6366F1)", border: "none", borderRadius: 8, color: "#fff", padding: "10px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: ff, boxShadow: "0 2px 8px #3B82F633" },
  exportBox: { width: "100%", background: "#0c1222", border: "1px solid #1e293b", borderRadius: 10, padding: "12px 14px", color: "#94A3B8", fontSize: 11, fontFamily: "'DM Mono',monospace", outline: "none", resize: "vertical", boxSizing: "border-box", lineHeight: 1.5 },
  tzTag: { fontSize: 9, opacity: 0.6, marginLeft: 2 },
  localHint: { fontSize: 11, color: "#60A5FA", background: "#3B82F610", borderRadius: 6, padding: "4px 9px", marginBottom: 6 },
  ub: { display: "flex", alignItems: "center", gap: 12, padding: "10px 22px", background: "#F59E0B08", borderBottom: "1px solid #F59E0B15", flexWrap: "wrap" },
  ul: { fontSize: 11, fontWeight: 700, color: "#F59E0B", whiteSpace: "nowrap" },
  ucs: { display: "flex", gap: 8, flexWrap: "wrap" },
  uc: { fontSize: 11, padding: "4px 12px", borderRadius: 6, background: "#F59E0B12", color: "#FCD34D", cursor: "pointer" },
  bd: { display: "flex", gap: 14, padding: "22px 18px", overflowX: "auto", minHeight: "calc(100vh - 140px)" },
  cl: { flex: "1 0 260px", maxWidth: 380, background: "rgba(22,32,50,.6)", borderRadius: 16, padding: 14, display: "flex", flexDirection: "column", gap: 8, border: "1px solid #1e293b88", transition: "border-color .2s,background .2s" },
  clo: { borderColor: "#3B82F6", background: "rgba(59,130,246,.05)" },
  ch: { display: "flex", alignItems: "center", gap: 8, paddingBottom: 10, borderBottom: "1px solid #1e293b66" },
  dt: { width: 8, height: 8, borderRadius: "50%" },
  cn: { fontSize: 13, fontWeight: 600, color: "#CBD5E1" },
  cc: { marginLeft: "auto", fontSize: 11, color: "#475569", background: "#0c1222", borderRadius: 10, padding: "2px 8px" },
  cls: { display: "flex", flexDirection: "column", gap: 10, flex: 1, minHeight: 60 },
  emp: { fontSize: 12, color: "#334155", textAlign: "center", padding: 24, border: "1px dashed #1e293b", borderRadius: 10 },
  card: { background: "#0f172a", borderRadius: 12, padding: "14px 16px 12px", cursor: "pointer", border: "1px solid #1e293b", transition: "all .2s", animation: "fi .3s ease" },
  r1: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 },
  co: { fontSize: 14, fontWeight: 700, color: "#F1F5F9" },
  pl: { fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 10 },
  ps: { fontSize: 12, color: "#94A3B8", marginBottom: 8 },
  lr: { display: "flex", gap: 6, marginBottom: 8 },
  lb: { display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, color: "#60A5FA", background: "rgba(59,130,246,.08)", border: "none", borderRadius: 6, padding: "4px 10px", cursor: "pointer", textDecoration: "none", fontFamily: ff, fontWeight: 500, transition: "background .15s" },
  nx: { fontSize: 11, color: "#94A3B8", background: "#1e293b", borderRadius: 7, padding: "5px 9px", marginBottom: 6 },
  pr: { display: "flex", alignItems: "center", gap: 8 },
  ds: { display: "flex", gap: 4 },
  dts: { width: 7, height: 7, borderRadius: "50%", transition: "background .2s" },
  pt: { fontSize: 10, color: "#475569" },
  ov: { position: "fixed", inset: 0, background: "rgba(0,0,0,.55)", backdropFilter: "blur(4px)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 100, padding: 16 },
  md: { background: "#1a2744", borderRadius: 18, padding: "26px 26px 20px", width: "100%", maxWidth: 520, maxHeight: "88vh", overflowY: "auto", border: "1px solid #2a3a55", boxShadow: "0 24px 60px rgba(0,0,0,.5)", animation: "si .2s ease" },
  mt: { margin: "0 0 4px", fontSize: 18, fontWeight: 700, color: "#F1F5F9" },
  eh: { display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 14 },
  es: { fontSize: 13, color: "#94A3B8" },
  hl2: { display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, color: "#60A5FA", background: "rgba(59,130,246,.1)", borderRadius: 8, padding: "6px 12px", textDecoration: "none", fontFamily: ff, fontWeight: 500, whiteSpace: "nowrap", transition: "background .15s" },
  db: { background: "#EF444418", border: "none", borderRadius: 8, color: "#EF4444", fontSize: 14, padding: "6px 10px", cursor: "pointer" },
  ts: { display: "flex", gap: 3, background: "#0f172a", borderRadius: 10, padding: 3, marginBottom: 16 },
  tb: { flex: 1, background: "transparent", border: "none", borderRadius: 8, padding: "8px 0", fontSize: 12, fontWeight: 500, color: "#64748B", cursor: "pointer", fontFamily: ff, transition: "all .15s" },
  ta2: { background: "#334155", color: "#E2E8F0" },
  tc: { minHeight: 180, animation: "fi .2s ease" },
  rc: { background: "#0f172a", borderRadius: 10, padding: "12px 14px", marginBottom: 10, border: "1px solid #1e293b" },
  rt: { display: "flex", alignItems: "center", gap: 8, marginBottom: 8 },
  rn: { fontSize: 12, fontWeight: 700, color: "#94A3B8" },
  ss: { background: "#1e293b", border: "1px solid #334155", borderRadius: 6, padding: "3px 8px", fontSize: 11, outline: "none", fontFamily: ff },
  rd: { marginLeft: "auto", background: "none", border: "none", color: "#64748B", fontSize: 14, cursor: "pointer", padding: "2px 6px" },
  rf: { display: "flex", gap: 6, marginBottom: 6 },
  er: { display: "flex", alignItems: "center", gap: 6 },
  gl: { fontSize: 11, color: "#60A5FA", background: "#3B82F610", borderRadius: 6, padding: "5px 10px", textDecoration: "none", fontFamily: ff, fontWeight: 500, whiteSpace: "nowrap", transition: "background .15s" },
  eh2: { textAlign: "center", color: "#475569", fontSize: 13, padding: 32 },
  arb: { background: "none", border: "1px dashed #334155", borderRadius: 10, color: "#64748B", fontSize: 12, padding: 12, width: "100%", cursor: "pointer", fontFamily: ff, fontWeight: 500, marginTop: 4 },
  g2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  la: { display: "block", fontSize: 11, fontWeight: 600, color: "#64748B", marginBottom: 5, textTransform: "uppercase", letterSpacing: ".04em" },
  inp: { width: "100%", background: "#0f172a", border: "1px solid #334155", borderRadius: 8, padding: "9px 12px", color: "#E2E8F0", fontSize: 13, outline: "none", fontFamily: ff, boxSizing: "border-box", transition: "border-color .15s" },
  sel: { width: "100%", background: "#0f172a", border: "1px solid #334155", borderRadius: 8, padding: "9px 12px", color: "#E2E8F0", fontSize: 13, outline: "none", fontFamily: ff, boxSizing: "border-box" },
  ta: { width: "100%", background: "#0f172a", border: "1px solid #334155", borderRadius: 8, padding: "10px 12px", color: "#E2E8F0", fontSize: 13, outline: "none", resize: "vertical", fontFamily: ff, boxSizing: "border-box", lineHeight: 1.5, transition: "border-color .15s" },
  ht: { fontSize: 11, color: "#475569", marginTop: 4 },
  prw: { display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" },
  pb: { border: "1.5px solid", borderRadius: 8, padding: "7px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: ff, background: "transparent", transition: "all .15s" },
  ma: { display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 18, paddingTop: 14, borderTop: "1px solid #2a3a55" },
  cb: { background: "#334155", border: "none", borderRadius: 8, color: "#94A3B8", padding: "9px 20px", fontSize: 13, cursor: "pointer", fontFamily: ff, fontWeight: 500 },
  svb: { background: "linear-gradient(135deg,#3B82F6,#6366F1)", border: "none", borderRadius: 8, color: "#fff", padding: "9px 24px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: ff, boxShadow: "0 2px 10px #3B82F633" },
  pageTabs: { display: "flex", background: "#1e293b", borderRadius: 8, overflow: "hidden", marginLeft: 4 },
  pageTab: { background: "transparent", border: "none", color: "#64748B", fontSize: 12, padding: "6px 14px", cursor: "pointer", fontFamily: ff, fontWeight: 600, transition: "all .15s" },
  pageTabAct: { background: "#334155", color: "#F1F5F9" },
  prepWrap: { padding: "22px 22px 40px", animation: "fi .25s ease" },
  prepHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18, gap: 16, flexWrap: "wrap" },
  prepTitle: { margin: "0 0 4px", fontSize: 18, fontWeight: 700, color: "#F1F5F9" },
  prepSub: { fontSize: 12, color: "#64748B" },
  prepActions: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" },
  selCount: { fontSize: 12, color: "#94A3B8", fontWeight: 500 },
  copyBtn: { background: "#1e293b", border: "1px solid #334155", borderRadius: 8, color: "#E2E8F0", padding: "8px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: ff, transition: "all .15s" },
  dlBtn: { background: "linear-gradient(135deg,#3B82F6,#6366F1)", border: "none", borderRadius: 8, color: "#fff", padding: "8px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: ff, boxShadow: "0 2px 8px #3B82F633" },
  prepTable: { background: "rgba(22,32,50,.6)", borderRadius: 14, border: "1px solid #1e293b88", overflow: "hidden" },
  prepRow0: { display: "flex", alignItems: "center", padding: "10px 16px", borderBottom: "1px solid #1e293b", gap: 8 },
  prepTh: { fontSize: 11, fontWeight: 600, color: "#64748B", textTransform: "uppercase", letterSpacing: ".04em" },
  prepRowItem: { display: "flex", alignItems: "center", padding: "14px 16px", borderBottom: "1px solid #1e293b33", gap: 8, cursor: "pointer", transition: "background .15s" },
  prepRowSel: { background: "rgba(59,130,246,.06)" },
  prepCk: { width: 28, flexShrink: 0, display: "flex", justifyContent: "center", cursor: "pointer" },
  ckOff: { fontSize: 18, color: "#475569", lineHeight: 1 },
  ckOn: { fontSize: 18, color: "#3B82F6", lineHeight: 1 },
  prepCo: { fontSize: 14, fontWeight: 700, color: "#F1F5F9" },
  prepPos: { fontSize: 13, color: "#CBD5E1" },
  prepTime: { fontSize: 12, color: "#94A3B8" },
  prepNa: { fontSize: 12, color: "#475569" },
  prepEmpty: { padding: 40, textAlign: "center", color: "#475569", fontSize: 13 },
  previewWrap: { marginTop: 20, background: "rgba(22,32,50,.6)", borderRadius: 14, border: "1px solid #1e293b88", overflow: "hidden" },
  previewHead: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: "1px solid #1e293b" },
  previewLabel: { fontSize: 13, fontWeight: 600, color: "#CBD5E1" },
  previewCount: { fontSize: 11, color: "#64748B" },
  previewBox: { margin: 0, padding: 16, fontSize: 12, color: "#94A3B8", background: "#0c1222", whiteSpace: "pre-wrap", wordBreak: "break-word", fontFamily: "'DM Mono', monospace", lineHeight: 1.6, maxHeight: 400, overflowY: "auto" },
  bkWrap: { padding: "22px 22px 40px", animation: "fi .25s ease" },
  bkHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, gap: 16, flexWrap: "wrap" },
  langToggle: { display: "flex", background: "#1e293b", borderRadius: 8, overflow: "hidden" },
  langBtn: { background: "transparent", border: "none", color: "#64748B", fontSize: 11, padding: "6px 12px", cursor: "pointer", fontFamily: ff, fontWeight: 600, transition: "all .15s" },
  langAct: { background: "#334155", color: "#F1F5F9" },
  bkSettings: { display: "flex", gap: 16, padding: "14px 18px", background: "rgba(22,32,50,.6)", borderRadius: 12, border: "1px solid #1e293b88", marginBottom: 18, flexWrap: "wrap", alignItems: "flex-end" },
  bkSetItem: { display: "flex", flexDirection: "column", gap: 4 },
  wkBtn: { background: "#1e293b", border: "1px solid #334155", borderRadius: 8, color: "#94A3B8", padding: "8px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: ff, transition: "all .15s" },
  wkOn: { background: "#10B98118", borderColor: "#10B981", color: "#10B981" },
  bkGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 10, marginBottom: 20 },
  bkDay: { background: "rgba(22,32,50,.6)", borderRadius: 12, border: "1px solid #1e293b88", overflow: "hidden" },
  bkDayHead: { display: "flex", alignItems: "center", gap: 6, padding: "10px 12px", borderBottom: "1px solid #1e293b66" },
  bkDate: { fontSize: 14, fontWeight: 700, color: "#F1F5F9" },
  bkDow: { fontSize: 11, color: "#64748B", fontWeight: 500 },
  bkAvail: { marginLeft: "auto", fontSize: 10, color: "#475569", background: "#0c1222", borderRadius: 8, padding: "2px 7px" },
  bkSlots: { padding: 6, display: "flex", flexDirection: "column", gap: 4 },
  bkSlot: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 10px", borderRadius: 8, border: "1px solid transparent", cursor: "pointer", fontFamily: ff, fontSize: 12, transition: "all .12s" },
  bkSlotOn: { background: "#10B98112", border: "1px solid #10B98133", color: "#10B981" },
  bkSlotOff: { background: "#1e293b44", border: "1px solid #1e293b", color: "#475569" },
  bkSlotOcc: { background: "#EF444410", border: "1px solid #EF444425", color: "#EF4444" },
  bkSlotTime: { fontWeight: 600, fontSize: 12 },
  bkSlotTag: { fontSize: 10, opacity: .8 },
  /* publish & bookings */
  publishBtn: { background: "linear-gradient(135deg,#10B981,#059669)", border: "none", borderRadius: 8, color: "#fff", padding: "10px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',system-ui,sans-serif", boxShadow: "0 2px 8px #10B98133", transition: "all .15s" },
  bookingsBtn: { background: "#1e293b", border: "1px solid #334155", borderRadius: 8, color: "#E2E8F0", padding: "10px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',system-ui,sans-serif", transition: "all .15s" },
  publishHint: { marginTop: 14, background: "#10B98115", border: "1px solid #10B98133", borderRadius: 12, padding: "14px 18px", fontSize: 13, color: "#10B981", lineHeight: 1.8 },
  publishLink: { display: "flex", alignItems: "center", gap: 8, marginTop: 6, background: "#0f172a", borderRadius: 8, padding: "8px 12px" },
  copySmBtn: { background: "#334155", border: "none", borderRadius: 6, color: "#E2E8F0", padding: "4px 10px", fontSize: 11, cursor: "pointer", fontFamily: "'DM Sans',system-ui,sans-serif", fontWeight: 600 },
  refreshBtn: { background: "none", border: "none", color: "#64748B", fontSize: 14, cursor: "pointer", padding: "2px 6px" },
  bookingRow: { padding: "12px 16px", borderBottom: "1px solid #1e293b33" },
  bookingMain: { display: "flex", alignItems: "center", gap: 10, marginBottom: 4, flexWrap: "wrap" },
  bookingDate: { fontSize: 12, color: "#60A5FA", fontWeight: 600 },
  bookingName: { fontSize: 14, fontWeight: 700, color: "#F1F5F9" },
  bookingCompany: { fontSize: 12, color: "#94A3B8" },
  bookingMeta: { display: "flex", gap: 12, fontSize: 12, color: "#64748B", flexWrap: "wrap" },
  bookingEmail: { color: "#60A5FA", textDecoration: "none" },
  bookingNotes: { color: "#94A3B8", fontStyle: "italic" },
};
