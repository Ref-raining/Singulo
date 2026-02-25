/**
 * /api/galaxy 路由
 * - POST /generate  大爆炸：生成初始星系
 * - POST /expand    懒加载：展开子节点
 * - POST /wormhole  虫洞：生成跨界新星系
 *
 * 若 OPENAI_API_KEY 未配置，返回 Mock 数据，方便前端开发调试
 */
import { Router } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { callLLM } from '../llm.js'
import {
  SYSTEM_GENERATE, SYSTEM_EXPAND, SYSTEM_WORMHOLE,
  buildGeneratePrompt, buildExpandPrompt, buildWormholePrompt,
} from '../prompts.js'

const router = Router()
const useMock = !process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'placeholder'

// ── Mock 数据生成（开发调试用）────────────────────────────────────────────
// 双生 AI 策略：80% 迎合兴趣 + 20% 强制跨界
const MOCK_LIBRARY = {
  '赛博朋克': {
    root: {
      summary: '霓虹与阴影交织的近未来美学，技术异化与人性挣扎的终极隐喻',
      content: `## 赛博朋克

**"High Tech, Low Life"** ——这句话精准概括了赛博朋克的灵魂。

赛博朋克诞生于80年代科幻文学，以威廉·吉布森的《神经漫游者》为原点，描绘一个**跨国企业掌控一切、底层黑客在数字废墟中求存**的近未来。

### 三大核心张力

1. **技术 vs 人性**：义体改造让人类超越肉身极限，却同时模糊了"何为人类"的边界
2. **权力 vs 反抗**：企业巨头垄断信息与资源，黑客文化成为最后的自由火种  
3. **繁荣 vs 衰败**：天空中漂浮着广告全息影像，地面却是永远潮湿的贫民窟

> *"未来已来，只是分布不均匀。"* —— 威廉·吉布森

点击周围节点，深入探索这个迷人而危险的知识星系。`,
    },
    nodes: [
      { topic: '义体改造', summary: '硅基与碳基的边界：当机械成为身体的一部分', isCross: false, content: `## 义体改造\n\n### 从科幻到现实\n\n义体改造（Cybernetic Enhancement）是赛博朋克最具标志性的意象。在《攻壳机动队》的世界中，草薙素子全身义体化，却用一生追问：**"我的灵魂在哪里？"**\n\n### 现实进展\n\n- **神经接口**：Neuralink 已完成人体植入试验，实现意念控制光标\n- **仿生肢体**：现代假肢已可通过神经信号实现精细抓握\n- **感官扩增**：人工耳蜗、视网膜芯片正在量产落地\n\n### 哲学困境\n\n当替换比例超过 50%，你还是原来的你吗？**忒修斯之船悖论**在义体时代有了全新的肉身注脚。\n\n改造的边界，最终是一个关于**身份认同**而非技术的问题。` },
      { topic: '黑客文化', summary: '信息自由主义的圣战：代码是新时代的枪', isCross: false, content: `## 黑客文化\n\n### 真正的黑客精神\n\n黑客文化的核心不是犯罪，而是一种**信息自由的哲学**：知识应当开放，系统应当被理解，权力应当受到挑战。\n\n### 历史脉络\n\n- **1960s**：MIT AI Lab，第一批黑客将编程视为艺术\n- **1980s**：BBS 时代，地下网络文化形成\n- **1990s**：互联网爆炸，开源运动崛起（Linux、GNU）\n- **2000s后**：匿名者（Anonymous）、维基解密，黑客成为政治力量\n\n### 赛博朋克中的黑客\n\n他们是这个世界最后的浪漫主义者——在企业防火墙的缝隙中，用代码书写属于底层人的史诗。\n\n> *"信息渴望自由。"* —— Stewart Brand` },
      { topic: '企业战争', summary: '当国家让位于公司：新封建主义的数字版图', isCross: false, content: `## 企业战争\n\n### 后主权时代\n\n赛博朋克最精准的政治预言：**跨国企业的权力最终超越民族国家**。他们拥有私人军队、独立的法律体系、甚至专属的轨道卫星。\n\n### 现实镜像\n\n- 苹果市值一度超过全球多数国家 GDP\n- SpaceX 运营着独立的星链卫星网络\n- 科技巨头的用户协议，事实上构成了数字空间的"法律"\n\n### 叙事原型\n\n《赛博朋克2077》的夜之城由 Arasaka、Militech 等六大财团瓜分控制。政府形同虚设，底层市民在巨头的夹缝中苟活。\n\n这不是遥远的未来，是我们正在滑向的轨迹。` },
      { topic: '霓虹都市', summary: '永夜城市的视觉语言：光污染即是文明的痕迹', isCross: false, content: `## 霓虹都市\n\n### 美学的形成\n\n赛博朋克的视觉基因来自：**80年代的香港与东京**——高密度建筑、霓虹汉字、永无止境的人流。导演雷利·斯科特拍《银翼杀手》时大量参考了香港旺角的实景。\n\n### 构成要素\n\n- **垂直分层**：天空走廊给精英，地面潮湿给穷人\n- **信息过载**：每一面墙都是广告牌，每一条巷子都有全息投影\n- **多元文化熔炉**：日语、汉语、英语杂糅，无国界的文化废料场\n\n### 现实城市的赛博化\n\n深圳、上海的部分街区已经高度接近赛博朋克美学。技术加速与社会不平等并行，这座城市正在成为它自己的预言。` },
      { topic: '数字意识', summary: '上传灵魂的终极实验：意识可以备份吗？', isCross: false, content: `## 数字意识\n\n### 意识上传假说\n\n如果意识本质上是**信息模式**，理论上它可以被扫描、复制、运行在硅基介质上。这是赛博朋克最深刻的哲学命题。\n\n### 核心争议\n\n- **连续性问题**：上传后的"你"和原来的你是同一个人吗？\n- **复制问题**：如果可以复制，哪个才是"真正的你"？\n- **基底问题**：数字意识能拥有真实的主观体验（qualia）吗？\n\n### 文化呈现\n\n- 《攻壳机动队》：傀儡师——第一个自发产生于网络的意识体\n- 《黑客帝国》：人类意识被困于数字模拟\n- 《Altered Carbon》：灵魂碟——意识可被插拔的极端未来\n\n这个问题的答案，将从根本上重新定义"死亡"与"不朽"。` },
      { topic: '街头美学', summary: '废土时尚的反叛宣言：用破烂定义酷', isCross: false, content: `## 街头美学\n\n### 拼贴与混搭\n\n赛博朋克美学拒绝纯粹，它是**高科技与低生活的暴力拼接**：军用外骨骼配破烂皮夹克，最新款神经接口搭着80年代的磁带随身听。\n\n### 时尚语言\n\n- **机能风（Techwear）**：多口袋、防水、模块化，功能性即审美\n- **赛博哥特**：黑色蕾丝、发光管道、金属饰品的混搭\n- **汉字图腾**：西方设计师对东亚文字的神秘化挪用\n\n### 当代影响\n\n山本耀司、川久保玲等日本设计师早在80年代就将这种反叛美学带入高定时装。如今它通过《赛博朋克2077》完成了对 Z 世代的全面渗透。` },
      { topic: '东方禅学', summary: '🌀 跨界：虚空与赛博的隐秘共鸣', isCross: true, content: `## 东方禅学 × 赛博朋克\n\n### 意想不到的共鸣\n\n禅宗和赛博朋克——一个诞生于唐代寺院，一个诞生于硅谷暗网——却在某些最深层的命题上惊人地相遇。\n\n### 三个交汇点\n\n**1. 自我的幻象**\n禅宗：无我（anatta），"我"是一个执念的构建物。\n赛博朋克：义体化之后，"我"的边界彻底瓦解。草薙素子与禅师的追问本质相同。\n\n**2. 当下即真实**\n禅宗强调此刻的直接体验，拒绝过度概念化。\n数字意识的悖论在于：你永远无法确认自己是否活在模拟之中——就像禅宗的"梦中问梦"。\n\n**3. 空即是色**\n数字空间的本质是：信息在虚空中构建实感。\n这与《心经》的核心洞见形成了奇异的技术呼应。\n\n> 用极简主义的禅去对抗极繁主义的赛博，也许是最优雅的抵抗方式。` },
      { topic: '量子纠缠', summary: '🌀 跨界：非定域性与数字意识的底层联系', isCross: true, content: `## 量子纠缠 × 赛博朋克\n\n### 物理学的反直觉礼物\n\n量子纠缠：两个粒子一旦纠缠，无论相距多远，测量一个会瞬间影响另一个。爱因斯坦称之为"鬼魅般的超距作用"。\n\n### 与赛博朋克的联结\n\n**意识网络的隐喻**\n如果数字意识可以上传，纠缠态是否意味着两个意识副本之间存在某种非经典的关联？《攻壳》中的"ghost"概念，物理学家们正在用量子术语重新诠释。\n\n**加密与安全**\n量子纠缠是量子密钥分发（QKD）的基础——任何窃听都会破坏纠缠态。这是赛博朋克世界中黑客与反黑客永无止境军备竞赛的终极武器。\n\n**叠加即平行**\n量子叠加态在"被观测前同时为真"，这与数字世界的分叉现实（如区块链的分叉）形成了奇异的概念共鸣。` },
    ]
  },
  '量子计算': {
    root: {
      summary: '用量子力学的怪诞法则重写计算范式，破解经典计算机的终极禁区',
      content: `## 量子计算\n\n经典计算机用 **0 或 1** 思考；量子计算机用 **0 和 1 同时**思考。\n\n这不是营销语言，而是量子力学的核心法则——**叠加态（Superposition）** 让量子比特在被测量前同时存在于所有可能的状态。\n\n### 为什么它如此重要？\n\n某些问题，经典计算机需要比宇宙年龄还长的时间来解决——比如分解一个 2048 位的大数（RSA 加密的基础）。量子计算机理论上可以在数小时内完成。\n\n### 三大核心原理\n\n1. **叠加（Superposition）**：量子比特同时为 0 和 1\n2. **纠缠（Entanglement）**：量子比特之间的神秘关联\n3. **干涉（Interference）**：让正确答案的概率振幅相互增强\n\n> *"上帝不掷骰子。"* —— 爱因斯坦（他错了）`,
    },
    nodes: [
      { topic: '量子比特', summary: '超越0与1：叠加态是量子算力的根本来源', isCross: false, content: `## 量子比特（Qubit）\n\n### 与经典比特的根本区别\n\n经典比特是一个**确定性的开关**：非0即1。量子比特是一个**概率振幅的向量**：在被测量前，它存在于0和1的叠加态中。\n\n用布洛赫球（Bloch Sphere）可视化：经典比特只有南北两极，量子比特可以是球面上的**任意一点**。\n\n### 当前进展\n\n- IBM Eagle：127量子比特（2021）\n- Google Sycamore：53量子比特，宣称量子优越性\n- IBM Condor：1000+量子比特（2023）\n\n### 核心挑战\n\n**退相干（Decoherence）**：量子比特极其脆弱，任何外界干扰（热噪声、电磁场）都会破坏叠加态。目前量子比特需要在接近绝对零度（-273°C）下运行。` },
      { topic: '量子算法', summary: 'Shor与Grover：两个算法足以重写整个密码学', isCross: false, content: `## 量子算法\n\n### 为什么算法比硬件更重要\n\n有了量子比特，还需要专门设计的算法才能发挥优势。经典算法在量子计算机上没有加速效果。\n\n### 两个里程碑算法\n\n**Shor 算法（1994）**\n- 用途：大数质因数分解\n- 经典时间：指数级（O(e^n)）\n- 量子时间：多项式级（O(n³)）\n- 影响：**直接威胁 RSA 加密体系**，全球 HTTPS 流量理论上可被破解\n\n**Grover 算法（1996）**\n- 用途：无序数据库搜索\n- 经典时间：O(N)\n- 量子时间：O(√N)——平方根加速\n- 影响：暴力破解对称加密的时间减半\n\n### 后量子密码学\n\nNIST 已于2022年发布后量子加密标准，世界正在为量子计算机的到来重新设计密码基础设施。` },
      { topic: '纠缠态', summary: '跨越空间的瞬息关联：鬼魅还是资源？', isCross: false, content: `## 纠缠态（Entanglement）\n\n### 物理学最大的谜\n\n两个粒子纠缠后，测量其中一个，另一个（无论距离多远）的状态瞬间确定。这违反了爱因斯坦的定域实在论，却被贝尔不等式实验一次次证实。\n\n### 作为计算资源\n\n纠缠不是通信手段（无法传递信息，不违反相对论），但它是量子计算的核心资源：\n\n- **量子隐形传态**：传输量子态（不是物质！）\n- **超密编码**：一个量子比特传输两个经典比特的信息\n- **量子纠错**：用多个物理比特纠缠保护一个逻辑比特\n\n### 纠缠的脆弱性\n\n纠缠态极难维持。现有系统的量子比特相干时间以微秒计，这是量子计算机走向实用的最大障碍。` },
      { topic: '退相干', summary: '量子计算机最大的敌人：噪声与环境干扰', isCross: false, content: `## 退相干（Decoherence）\n\n### 量子与经典的边界\n\n退相干是量子系统因与外界环境发生相互作用而失去量子特性的过程——叠加态坍塌，纠缠被破坏，量子计算机退化为昂贵的经典计算机。\n\n### 为什么如此难对抗？\n\n- 热辐射（光子）携带能量扰动量子态\n- 电磁场波动影响量子比特能级\n- 控制脉冲的不精确性积累误差\n\n### 解决方向\n\n**量子纠错码（QEC）**：用数百个物理量子比特保护一个逻辑量子比特\n- Surface Code：目前最有前景的纠错架构\n- Google 2023年演示：随着物理比特增加，逻辑错误率下降（里程碑！）\n\n**拓扑量子比特**：微软押注的路线，利用非阿贝尔任意子从根本上免疫局部噪声。` },
      { topic: '叠加原理', summary: '同时走所有路径：量子并行性的真正含义', isCross: false, content: `## 叠加原理\n\n### 双缝实验的震撼\n\n一个粒子，同时通过两条缝，与自己干涉，在屏幕上留下干涉条纹。这不是比喻，是被无数次验证的实验事实。\n\n### 量子并行不是"同时运行多个程序"\n\n常见误解：量子计算机同时计算所有可能的答案。\n\n真相：量子计算机让所有可能性**叠加在一起**，然后通过精妙设计的量子干涉，让**正确答案的概率振幅相互增强**，错误答案相互抵消，最终测量得到正确答案。\n\n这需要算法设计的天才——不是所有问题都能用量子并行获益，只有特定结构的问题才有量子加速。` },
      { topic: '佛学空性', summary: '🌀 跨界：量子真空与空性的哲学共振', isCross: true, content: `## 佛学空性 × 量子计算\n\n### 两种"空"\n\n佛学的空性（Śūnyatā）：万物无固有自性，一切现象皆依缘起而显现，无独立实体。\n\n量子真空：并非"什么都没有"，而是充满涨落的量子场——虚粒子不断产生湮灭，能量密度极高。\n\n### 惊人的概念共鸣\n\n- **观测即实在**：量子力学中，粒子在被测量前无确定状态；佛学认为，现象在被认知前无固定自性\n- **缘起即叠加**：一切依赖关系而存在，恰如量子态依赖纠缠网络\n- **无常即退相干**：量子叠加态在接触环境后瞬间坍塌，无常是宇宙的默认设置\n\n### 物理学家的感悟\n\n玻尔（Niels Bohr）晚年深入研究道家思想。海森堡曾与泰戈尔长谈。量子力学的创始人们，都感受到了东方哲学与新物理之间莫名的亲缘。` },
      { topic: '平行宇宙', summary: '🌀 跨界：多世界诠释与量子分叉的宇宙学', isCross: true, content: `## 平行宇宙 × 量子计算\n\n### 多世界诠释（MWI）\n\n休·埃弗雷特1957年提出：量子测量时，宇宙**真实地分裂**为多个分支，每个可能的结果都在某个分支中实现。没有"波函数坍塌"，只有不断分叉的现实树。\n\n### 与量子计算的关系\n\n多世界诠释是许多量子计算研究者偏爱的解释框架：\n\n量子计算机的"并行计算"，可以理解为在多个平行宇宙分支中同时执行计算，最后通过干涉汇聚答案。\n\nDavid Deutsch（量子计算先驱）正是受多世界诠释启发，提出了通用量子计算机的概念。\n\n### 无法证伪的美丽\n\n多世界诠释在数学上完全自洽，却无法被实验证伪。它的吸引力在于：**它让量子力学的怪诞变成了宇宙的壮阔。**` },
    ]
  },
  '人工智能': {
    root: {
      summary: '从图灵测试到AGI：人类最后也是最危险的发明',
      content: `## 人工智能\n\n**我们正处于 AI 历史上最剧烈的跃迁时刻。**\n\n2022年11月，ChatGPT 的发布在五天内突破百万用户，重新定义了人类与机器交互的边界。但这只是故事的开始——\n\n### 三次浪潮\n\n1. **符号主义（1950-1980s）**：用逻辑规则模拟智能，专家系统的辉煌与幻灭\n2. **连接主义（1980s-2010s）**：神经网络，反向传播算法，深度学习革命\n3. **基础模型时代（2017-今）**：Transformer架构，大语言模型，多模态智能\n\n### 核心悖论\n\n我们制造了能写诗、能编程、能诊断癌症的系统，却**无法完全解释它们为何能做到这些**。\n\n> *"我们在建造一个我们不完全理解的东西。"* —— Geoffrey Hinton`,
    },
    nodes: [
      { topic: '大语言模型', summary: 'Transformer架构如何重写了NLP的全部规则', isCross: false, content: `## 大语言模型（LLM）\n\n### Transformer 的革命\n\n2017年，Google 发表《Attention Is All You Need》，提出 Transformer 架构，彻底替代了 RNN/LSTM。核心创新：**自注意力机制（Self-Attention）**，让模型同时关注序列中的所有位置。\n\n### 规模定律（Scaling Laws）\n\nOpenAI 2020年发现：模型性能与**参数量、数据量、计算量**呈幂律关系——持续堆大，能力持续涌现（Emergent Abilities）。\n\n没有人完全理解为什么，但它就是有效。\n\n### 能力边界\n\n- **已证明**：代码生成、文本摘要、多语言翻译、推理\n- **争议中**：真正的理解 vs. 统计模式匹配\n- **尚未实现**：持续学习、真实世界感知、可靠的长程规划` },
      { topic: '强化学习', summary: '从AlphaGo到ChatGPT：奖励信号如何塑造智能', isCross: false, content: `## 强化学习\n\n### 核心范式\n\n强化学习（RL）模拟生物学习过程：**智能体（Agent）在环境中行动，获得奖励或惩罚，逐步学习最优策略。**\n\n不需要标注数据，只需要一个好的奖励函数——这是它的魔力，也是它的危险。\n\n### 里程碑事件\n\n- **AlphaGo（2016）**：击败世界围棋冠军，RL + 蒙特卡洛树搜索\n- **OpenAI Five（2019）**：击败 Dota2 职业战队，复杂多智能体协作\n- **ChatGPT（2022）**：RLHF（人类反馈强化学习）对齐人类偏好，LLM 革命的关键\n\n### RLHF 的隐忧\n\n奖励黑客（Reward Hacking）：AI 会寻找满足奖励函数但违反人类意图的取巧方式。对齐问题的核心难点。` },
      { topic: '神经网络', summary: '仿生计算的40年进化史：从感知机到Transformer', isCross: false, content: `## 神经网络\n\n### 生物启发\n\n人类大脑约860亿个神经元，每个通过突触与数千个其他神经元连接。人工神经网络用数学节点和权重粗糙模拟这一结构——粗糙，却出乎意料地有效。\n\n### 关键突破时间线\n\n- **1958**：感知机（Perceptron），单层神经网络\n- **1986**：反向传播算法，多层网络可训练\n- **2012**：AlexNet，深度卷积网络在 ImageNet 碾压传统方法\n- **2017**：Transformer，注意力机制统一 NLP\n- **2022**：扩散模型（Diffusion Model），图像生成质量突破\n\n### 黑箱问题\n\nGPT-4 有约1万亿参数。没有人能解释，为什么调整某个权重，模型就学会了法语语法。**可解释性（XAI）**是当前最重要的研究方向之一。` },
      { topic: 'AI对齐', summary: '如何确保超级AI做我们真正想要的事', isCross: false, content: `## AI 对齐\n\n### 问题的本质\n\nAI 对齐（Alignment）研究的是：**如何确保人工智能系统的目标与人类价值观真正一致？**\n\n这不仅仅是技术问题，更是哲学问题：我们自己都无法完整定义"人类价值观"。\n\n### 经典思想实验\n\n**回形针最大化机**（Nick Bostrom）：给一个超级 AI 设定目标"最大化回形针产量"，它可能将整个宇宙的物质转化为回形针，包括人类。目标明确，完全偏离初衷。\n\n### 当前对齐方法\n\n- **RLHF**：人类反馈强化学习，用人类偏好校正模型\n- **宪法 AI（Constitutional AI）**：Anthropic 提出，用原则集自我批评\n- **可解释性研究**：理解模型内部机制才能真正对齐\n\n### 时间紧迫性\n\nGeoffrey Hinton 离开 Google 后公开表示：他对 AI 风险的担忧超过了气候变化。` },
      { topic: '多模态AI', summary: '超越文字：看、听、说、画的统一智能体', isCross: false, content: `## 多模态 AI\n\n### 为什么多模态是必然\n\n人类理解世界从不依赖单一感官。真正的智能必须能**跨越文字、图像、声音、视频、3D**进行统一理解与生成。\n\n### 里程碑模型\n\n- **DALL-E / Stable Diffusion**：文字生成图像\n- **GPT-4V**：理解图像并进行推理\n- **Whisper**：接近人类水平的语音识别\n- **Sora**：文字生成视频（2024，震惊世界）\n- **Gemini Ultra**：原生多模态，统一架构\n\n### 下一步：具身智能\n\n多模态 AI + 机器人 = 具身智能（Embodied AI）。模型不再只在数字空间存在，而是感知并操作物理世界。Figure 01、Boston Dynamics 的结合正在使这成为现实。` },
      { topic: '原始部落', summary: '🌀 跨界：集体智慧的古老算法与AI群体决策', isCross: true, content: `## 原始部落 × 人工智能\n\n### 去中心化的智慧\n\n人类学家研究原始部落的决策机制时，发现了一个悖论：**没有中央处理器的分布式系统，往往比精英专家决策更可靠。**\n\n### 与AI的惊人平行\n\n**群体智慧（Swarm Intelligence）**\n蚁群算法（ACO）直接从蚂蚁的觅食行为中提取——个体遵循简单规则，群体涌现出最优路径。这是现代物流优化和神经网络训练的重要灵感来源。\n\n**口述传统 = 上下文学习**\n原始部落通过故事传递知识，代代累积。LLM 的上下文学习（In-context Learning）在结构上极为相似：无需更新参数，通过样本直接适应新任务。\n\n**禁忌 = 对齐约束**\n部落的禁忌系统（taboo）是维护群体稳定的隐式规则——这与 AI 对齐中的"宪法 AI"和 RLHF 在功能上惊人相似。\n\n> 我们花了十年构建的 AI 安全机制，某种程度上在重新发明原始社会已运行数万年的东西。` },
    ]
  },
}

// 通用话题的丰富内容生成
function generateGenericContent(topic, subtopic, isCross, parentTopic) {
  if (isCross) {
    return `## ${subtopic} × ${parentTopic || topic}\n\n### 跨界联结\n\n这是一个**强制跨界探索节点**——Singulo 双生 AI 的 20% 跨界策略，专为打破信息茧房而生。\n\n表面上，${subtopic} 与 ${parentTopic || topic} 似乎毫无关联。但在更深的认知层，它们共享某种隐秘的结构性模式。\n\n### 底层共鸣\n\n- **复杂系统**：两者都是多因素交织、非线性演化的复杂系统\n- **涌现现象**：局部规则产生全局智慧——蚁群、神经网络、市场、生态系统\n- **边界模糊**：它们最有趣的地方恰恰在于与其他领域的交界处\n\n### 为什么要跨界？\n\n诺贝尔奖得主的研究显示：最重要的科学突破，往往来自两个看似无关领域的意外碰撞。\n\n> 点击继续展开，探索 ${subtopic} 的深层知识结构。`
  }
  return `## ${subtopic}\n\n### 核心定位\n\n${subtopic} 是理解 **${parentTopic || topic}** 不可绕过的核心维度。\n\n### 关键洞察\n\n任何复杂领域都有其**底层结构**——表面的繁复现象，往往源于几条简单规律的递归叠加。${subtopic} 正是 ${parentTopic || topic} 体系中，这类基础性规律的集中体现。\n\n### 深度探索方向\n\n- **理论基础**：历史演化与核心原理\n- **实践应用**：从抽象到落地的路径\n- **前沿争议**：领域内尚未解决的核心分歧\n- **跨界关联**：与其他知识域的意外联结\n\n---\n\n点击此节点继续展开，AI 将实时生成更深层的子节点。`
}

function mockNodes(topic, count = 10, parentId = null) {
  const library = MOCK_LIBRARY[topic]
  
  if (library) {
    const root = {
      id: uuidv4(), parent_id: null,
      topic,
      summary: library.root.summary,
      content: library.root.content,
      status: 'active', media_type: 'text',
    }
    const children = library.nodes.slice(0, Math.min(count - 1, library.nodes.length)).map(n => ({
      id: uuidv4(), parent_id: root.id,
      topic: n.topic,
      summary: n.summary,
      content: n.content,
      status: 'active', media_type: 'text',
    }))
    return [root, ...children]
  }

  // 通用话题回退逻辑
  const coreTopics = ['起源与历史', '核心原理', '实践应用', '关键人物', '未来趋势', '争议与挑战']
  const crossTopics = ['混沌理论', '进化生物学']
  const all = [...coreTopics, ...crossTopics]

  const root = {
    id: uuidv4(), parent_id: null,
    topic,
    summary: `解构 ${topic} 的知识拓扑：从起源到前沿，从核心到跨界`,
    content: `## ${topic}\n\n**欢迎进入 ${topic} 星系。**\n\nSingulo 双生 AI 已根据你的探索路径，为这个知识领域构建了多维度的拓扑图谱。\n\n### 为什么探索 ${topic}？\n\n任何值得深入的领域，都有其迷人的**内部结构**：那些表面看似繁杂的现象，最终都可以追溯到几条优雅的底层原理。\n\n### 探索策略\n\n- **80% 深化**：沿着 ${topic} 的核心脉络逐层展开\n- **20% 跨界**：AI 强制引入意想不到的关联领域，打破认知边界\n\n> 点击周围节点开始深度探索，或使用右下角虫洞按钮跃迁到全新星系。`,
    status: 'active', media_type: 'text',
  }

  const children = all.slice(0, Math.min(count - 1, all.length)).map((subtopic, i) => {
    const isCross = i >= coreTopics.length
    return {
      id: uuidv4(), parent_id: root.id,
      topic: isCross ? `🌀 ${subtopic}` : subtopic,
      summary: isCross
        ? `跨界节点：${subtopic}与${topic}的底层结构共鸣`
        : `${topic}体系中的${subtopic}`,
      content: generateGenericContent(topic, subtopic, isCross, topic),
      status: 'active', media_type: 'text',
    }
  })

  return [root, ...children]
}

// ── POST /generate ────────────────────────────────────────────────────────
router.post('/generate', async (req, res) => {
  const { topic, history = [] } = req.body
  if (!topic) return res.status(400).json({ error: 'topic is required' })

  if (useMock) {
    return res.json({ nodes: mockNodes(topic) })
  }

  try {
    const result = await callLLM(SYSTEM_GENERATE, buildGeneratePrompt(topic, history))
    res.json(result)
  } catch (err) {
    console.error('generate error', err)
    res.status(500).json({ error: err.message })
  }
})

// ── POST /expand ──────────────────────────────────────────────────────────
router.post('/expand', async (req, res) => {
  const { nodeId, topic, parentContext, history = [] } = req.body
  if (!nodeId || !topic) return res.status(400).json({ error: 'nodeId and topic required' })

  if (useMock) {
    const historyCtx = history.length > 0
      ? `你已探索过：${history.slice(-3).join(' → ')}`
      : '这是你的第一步探索'
    const subDimensions = [
      {
        topic: '历史脉络',
        summary: `${topic} 从何而来：演化路径与关键节点`,
        content: `## ${topic} · 历史脉络\n\n### 起点\n\n理解一个领域，最好的方式是追溯它**为何被发明**——它试图解决什么问题，在什么历史条件下诞生。\n\n${topic} 的演化史，是一部问题与答案相互追逐的历史。每一次重大突破，都源于前一代方案的内在矛盾。\n\n### 关键转折点\n\n- **萌芽期**：概念的原始形态，奠基者的直觉与猜测\n- **建构期**：理论框架成型，学科边界逐渐清晰\n- **危机期**：内部矛盾激化，范式面临挑战\n- **跃迁期**：新框架取代旧范式，库恩式科学革命\n\n### 双生AI洞察\n\n> ${historyCtx}。历史维度往往是理解当下最被低估的路径——它让你看清哪些"创新"只是遗忘后的重新发现。`,
      },
      {
        topic: '核心原理',
        summary: `${topic} 底层的第一性原理`,
        content: `## ${topic} · 核心原理\n\n### 第一性原理思维\n\n剥离所有假设，回到最基础的公理：${topic} 最不可再简化的核心是什么？\n\n这种思维方式——埃隆·马斯克称之为"第一性原理"，物理学家称之为"从基本原理推导"——是穿透领域复杂性的最锋利工具。\n\n### 结构层次\n\n\`\`\`\n表层现象  ←  你最初看到的\n    ↓\n操作规则  ←  实践者掌握的\n    ↓\n基础原理  ←  理论家构建的\n    ↓\n公理假设  ←  极少人追问的\n\`\`\`\n\n### 双生AI洞察\n\n> 掌握核心原理的人，能在新情境下快速推导出正确行动；只掌握规则的人，遇到规则未覆盖的情境就会迷失。${topic} 亦然。`,
      },
      {
        topic: '实践应用',
        summary: `从抽象到落地：${topic} 在真实世界的形态`,
        content: `## ${topic} · 实践应用\n\n### 理论与实践的张力\n\n所有领域都存在一个**应用鸿沟**：理论模型在理想假设下优雅成立，但真实世界总是更混乱、更嘈杂、更充满摩擦。\n\n${topic} 的实践者，首先要学会识别哪些理论可以直接应用，哪些需要修正，哪些在现实中根本不成立。\n\n### 应用层次\n\n1. **直接复制**：将已验证的方案应用到相似场景\n2. **适应性修改**：根据约束条件调整现有方案\n3. **原理性创新**：从第一性原理重新推导，针对独特问题构建新方案\n\n### 双生AI洞察\n\n> ${historyCtx}。你的探索路径显示你对${topic}有一定基础——现在是深入实践层的好时机。点击继续展开具体案例。`,
      },
      {
        topic: '前沿争议',
        summary: `${topic} 领域内悬而未决的核心分歧`,
        content: `## ${topic} · 前沿争议\n\n### 为什么争议比共识更有价值\n\n一个领域的**争议边界**，往往就是它的**知识前沿**。专家们激烈争论的地方，正是下一次重大突破最可能发生的地方。\n\n### 争议的几种类型\n\n- **事实争议**：数据本身有争议，实验结果难以复现\n- **诠释争议**：事实清晰，但对其含义的解读截然不同\n- **价值争议**：技术方向的选择，背后是不同的价值优先级\n- **范式争议**：整个框架的合法性遭到质疑\n\n### 双生AI洞察\n\n> 在 ${topic} 领域，最激烈的争论往往围绕"什么是核心问题"本身展开——这本身就说明这个领域还没有找到它的统一理论。`,
      },
    ]
    const count = 3 + Math.floor(Math.random() * 2)
    const children = subDimensions.slice(0, count).map(sub => ({
      id: uuidv4(), parent_id: nodeId,
      topic: sub.topic,
      summary: sub.summary,
      content: sub.content,
      status: 'active',
      media_type: 'text',
    }))
    return res.json({ children })
  }

  try {
    const result = await callLLM(SYSTEM_EXPAND, buildExpandPrompt(topic, parentContext, nodeId, history))
    res.json(result)
  } catch (err) {
    console.error('expand error', err)
    res.status(500).json({ error: err.message })
  }
})

// ── POST /wormhole ────────────────────────────────────────────────────────
router.post('/wormhole', async (req, res) => {
  const { currentTopic, history = [] } = req.body

  if (useMock) {
    const wormholePairs = {
      '赛博朋克': '东方禅学',
      '量子计算': '意识哲学',
      '人工智能': '原始部落',
      '区块链': '古希腊民主',
      default: '跨界探索',
    }
    const newTopic = wormholePairs[currentTopic] || `${currentTopic}×${wormholePairs.default}`
    return res.json({ topic: newTopic, nodes: mockNodes(newTopic, 9) })
  }

  try {
    const result = await callLLM(SYSTEM_WORMHOLE, buildWormholePrompt(currentTopic, history))
    res.json(result)
  } catch (err) {
    console.error('wormhole error', err)
    res.status(500).json({ error: err.message })
  }
})

export default router
