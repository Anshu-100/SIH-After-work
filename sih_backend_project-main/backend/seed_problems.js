/**
 * seed_problems.js
 * Inserts 50 diverse civic problems across Jharkhand into MongoDB.
 * Run: node seed_problems.js
 */

require("dotenv").config();
const mongoose = require("mongoose");
const Task = require("./models/Task");

const MONGO_URI = process.env.MONGO_URI;

const PROBLEMS = [
  // ── Urban Infrastructure ──────────────────────────────────────────
  {
    title: "Massive pothole crater on NH-33 near Ranchi bypass causing accidents",
    category: "Urban Infrastructure",
    severity: "CRITICAL",
    status: "pending",
    location: "Ranchi",
    description: "A crater-sized pothole has appeared on National Highway 33 near the Ranchi bypass. Three motorcycle accidents have been reported in the last 48 hours. The pothole is approximately 4 feet wide and 2 feet deep. No warning signs have been placed. Emergency repair is needed.",
  },
  {
    title: "Footover bridge at Dhanbad station has severely rusted pillars",
    category: "Urban Infrastructure",
    severity: "HIGH",
    status: "in-progress",
    location: "Dhanbad",
    description: "The footover bridge connecting platforms 1 and 3 at Dhanbad railway station has severely corroded iron pillars. Rust flakes are falling on passengers. Several hundred passengers use this bridge daily. Structural inspection is urgently needed.",
  },
  {
    title: "Open manholes on main road of Bokaro Steel City ward 12",
    category: "Urban Infrastructure",
    severity: "HIGH",
    status: "pending",
    location: "Bokaro",
    description: "Three manholes on the main commercial street of Ward 12 in Bokaro Steel City are open and uncovered. A child nearly fell in last week. Street vendors and pedestrians are forced to walk around them into oncoming traffic. Immediate covering and barricading required.",
  },
  {
    title: "Road excavation for gas pipeline left unpaved for 6 months in Jamshedpur",
    category: "Urban Infrastructure",
    severity: "MEDIUM",
    status: "pending",
    location: "Jamshedpur",
    description: "A road in Sakchi, Jamshedpur was dug up 6 months ago for gas pipeline laying and has not been restored. The unpaved stretch causes daily skidding accidents especially during rain. Dust clouds affect nearby shops and residents.",
  },
  {
    title: "Streetlights non-functional on entire stretch of Station Road, Hazaribagh",
    category: "Urban Infrastructure",
    severity: "HIGH",
    status: "pending",
    location: "Hazaribagh",
    description: "All 28 streetlights on the 3 km Station Road in Hazaribagh have been non-functional for the past 3 weeks. The area has seen an increase in chain-snatching and road accidents after dark. Multiple complaints filed but no action taken.",
  },

  // ── Water Management ─────────────────────────────────────────────
  {
    title: "Drinking water contaminated with sewage in Deoghar municipal supply",
    category: "Water Management",
    severity: "CRITICAL",
    status: "pending",
    location: "Deoghar",
    description: "Residents of Ward 5 in Deoghar are receiving brownish, foul-smelling water from municipal taps. Lab tests by a local NGO confirmed sewage contamination. Over 200 households are affected. At least 15 children have been hospitalized with gastroenteritis. Immediate water tanker supply and pipe repair needed.",
  },
  {
    title: "Water supply pipeline broken near Dumka collector's office for 10 days",
    category: "Water Management",
    severity: "HIGH",
    status: "pending",
    location: "Dumka",
    description: "The main PHED water supply pipeline near the Dumka Collector's office has been ruptured for 10 days, flooding the adjacent road and wasting thousands of liters daily. The entire sector 4 colony is without water supply. Residents are purchasing water at inflated prices.",
  },
  {
    title: "Borewell pump burned out leaving Giridih village without water for 2 weeks",
    category: "Water Management",
    severity: "HIGH",
    status: "pending",
    location: "Giridih",
    description: "The community borewell pump motor in Pathargama village, Giridih district burned out two weeks ago. The 350 residents of the village have no drinking water source. Women are walking 4 km daily to fetch water from a stream. PHED has not responded despite 3 complaints.",
  },
  {
    title: "Illegal groundwater extraction by brick kilns depleting water table in Palamu",
    category: "Water Management",
    severity: "MEDIUM",
    status: "in-progress",
    location: "Palamu",
    description: "Five brick kilns operating illegally near Medininagar in Palamu district are extracting groundwater without permission, causing water tables to drop drastically. Handpumps in nearby villages have gone dry. Farmers cannot irrigate their crops. District administration has been notified.",
  },
  {
    title: "Water tank leak wasting 50,000 liters daily in Chaibasa municipal area",
    category: "Water Management",
    severity: "MEDIUM",
    status: "pending",
    location: "Chaibasa",
    description: "The overhead water storage tank in Chaibasa's ward 8 has a significant crack causing continuous leakage. Estimated 50,000 liters are being wasted daily. The road below is perpetually waterlogged causing road damage and mosquito breeding.",
  },

  // ── Healthcare ────────────────────────────────────────────────────
  {
    title: "Sadar Hospital Ranchi ICU oxygen cylinder supply disrupted",
    category: "Healthcare",
    severity: "CRITICAL",
    status: "in-progress",
    location: "Ranchi",
    description: "The Intensive Care Unit at Sadar Hospital Ranchi had its central oxygen pipeline fail on the night of 12th September. Staff resorted to portable cylinders which ran out for approximately 40 minutes. 3 critical patients were at risk. Hospital administration is investigating the oxygen supplier's delay.",
  },
  {
    title: "No doctor posted at Primary Health Centre Garhwa for 3 months",
    category: "Healthcare",
    severity: "HIGH",
    status: "pending",
    location: "Garhwa",
    description: "The Primary Health Centre serving 12 villages in Garhwa block has been without a medical officer for 3 months. Only a nurse attends. Pregnant women and emergency patients are being referred 35 km away to the district hospital. Several cases of delayed treatment have been reported.",
  },
  {
    title: "Anti-snake venom out of stock at Khunti district hospital",
    category: "Healthcare",
    severity: "CRITICAL",
    status: "pending",
    location: "Khunti",
    description: "Khunti district hospital, serving a heavily forested tribal area with high snake bite incidence, has been without anti-snake venom (ASV) stock for 15 days. One patient died last week after being bitten and the hospital could not provide ASV. Immediate restocking from state medical stores is needed.",
  },
  {
    title: "Ambulance service dial 108 not responding in Latehar for emergency calls",
    category: "Healthcare",
    severity: "HIGH",
    status: "pending",
    location: "Latehar",
    description: "The national 108 ambulance service is reportedly not responding to emergency calls in Latehar district. In the last month, two women in labor had to travel by motorcycle to the hospital. The ambulance stationed at Latehar has been out of service for a week due to fuel shortage. 12 calls went unanswered last week.",
  },
  {
    title: "Community health centre Seraikela running without electricity for 5 days",
    category: "Healthcare",
    severity: "HIGH",
    status: "pending",
    location: "Seraikela",
    description: "The Community Health Centre at Seraikela has been without electricity for 5 days after a transformer breakdown. Surgeries and deliveries are being conducted with mobile phone flashlights. The diesel generator fuel ran out on day 2. Lab reports cannot be generated. Night emergencies are especially dangerous.",
  },

  // ── Education ─────────────────────────────────────────────────────
  {
    title: "Roof of government school in Simdega collapsed after heavy rain",
    category: "Education",
    severity: "CRITICAL",
    status: "in-progress",
    location: "Simdega",
    description: "The roof of two classrooms at Government Middle School Kolebira in Simdega collapsed following heavy monsoon rains. 45 students were luckily absent at the time. The school building is 40 years old and has not been repaired in a decade. Students are now studying under a tree. SSA has been informed but no repair work started.",
  },
  {
    title: "Only 1 teacher for 5 classes at government primary school Pakur",
    category: "Education",
    severity: "HIGH",
    status: "pending",
    location: "Pakur",
    description: "Upgraded Primary School Amtola in Pakur district has 187 enrolled students across Classes 1-5 but only 1 regular teacher. The 4 sanctioned posts are vacant. Mid-day meal is also not being served regularly due to no cook appointment. Parents threatening to pull children out.",
  },
  {
    title: "No drinking water or toilet facility at government school in Sahebganj",
    category: "Education",
    severity: "HIGH",
    status: "pending",
    location: "Sahebganj",
    description: "Government High School in Borio block of Sahebganj has 320 students but no functional water tap or toilet. The existing toilets have been locked for 2 years due to being damaged. Girl students are particularly affected. Hand-pumps in the school campus are non-functional.",
  },
  {
    title: "Mid-day meal not served for a month in tribal belt school Godda",
    category: "Education",
    severity: "MEDIUM",
    status: "pending",
    location: "Godda",
    description: "Government Primary School in Sunderpahari block, Godda has not served mid-day meals to 90 children for a month due to non-supply of food grains from the block office. Many children from below-poverty-line families depend on this meal as their main nutritious meal of the day. Attendance has dropped by 35%.",
  },
  {
    title: "Digital classroom equipment lying unused due to no internet connection in Koderma",
    category: "Education",
    severity: "MEDIUM",
    status: "pending",
    location: "Koderma",
    description: "Smart classroom equipment worth Rs. 4 lakh installed at Government High School Koderma six months ago is lying idle. The school has no broadband internet connection despite the National Optical Fibre Network (NOFN) cable passing nearby. Equipment is degrading due to non-use.",
  },

  // ── Agriculture ───────────────────────────────────────────────────
  {
    title: "Canal breach causing massive crop damage in East Singhbhum farming region",
    category: "Agriculture",
    severity: "CRITICAL",
    status: "in-progress",
    location: "East Singhbhum",
    description: "A major breach in the Subarnarekha irrigation canal in East Singhbhum has flooded 500 acres of paddy fields in the midst of kharif harvest season. Approximately 200 farmers have suffered total crop loss. The breach was reported 3 days ago but canal department workers have not arrived. Compensation survey also not yet initiated.",
  },
  {
    title: "Locust swarm destroying standing wheat crops in Gumla district",
    category: "Agriculture",
    severity: "CRITICAL",
    status: "pending",
    location: "Gumla",
    description: "A locust swarm was spotted in Gumla district destroying standing rabi wheat crops. Approximately 800 acres are at risk. Farmers are using drums and firecrackers to drive away locusts but need agricultural department pesticide spraying support immediately. Block office unresponsive.",
  },
  {
    title: "Subsidized fertilizer not available at cooperative society in West Singhbhum",
    category: "Agriculture",
    severity: "HIGH",
    status: "pending",
    location: "West Singhbhum",
    description: "Farmers in Chakradharpur area of West Singhbhum are unable to get urea fertilizer at the government cooperative society. The fertilizer is available at black market price (Rs. 450/bag vs. Rs. 266 subsidized). The cooperative society has not received stock for 3 weeks despite it being peak sowing season.",
  },
  {
    title: "Wild elephant attacks damaging crops and homes in Hazaribagh forest fringe",
    category: "Agriculture",
    severity: "HIGH",
    status: "in-progress",
    location: "Hazaribagh",
    description: "A herd of 12 wild elephants from the Hazaribagh Wildlife Sanctuary has been raiding farmlands in 5 villages in the forest fringe area. In the past two weeks, 30 acres of maize and vegetable crops have been destroyed and two mud houses damaged. Forest department has erected no barriers or deployed any deterrents.",
  },
  {
    title: "Solar-powered irrigation pump not working since installation in Ramgarh",
    category: "Agriculture",
    severity: "MEDIUM",
    status: "pending",
    location: "Ramgarh",
    description: "A solar-powered irrigation pump installed under the PM-KUSUM scheme in Rajrappa village, Ramgarh district has not worked since its inauguration 4 months ago due to a missing control panel component. 35 farmers dependent on this pump for irrigation are manually drawing water or leaving fields fallow.",
  },

  // ── Environment ───────────────────────────────────────────────────
  {
    title: "Illegal coal dumping polluting Damodar river at Dhanbad stretch",
    category: "Environment",
    severity: "CRITICAL",
    status: "in-progress",
    location: "Dhanbad",
    description: "A private coal company has been illegally dumping coal slurry into the Damodar river near Jharia in Dhanbad district. Black chemical-laden effluent is visible for 5 km downstream. Fish are dying. Downstream communities using river water for drinking are at risk. CPCB and JSPCB have been notified but no action taken.",
  },
  {
    title: "Stone quarry dust causing respiratory illness in Giridih villages",
    category: "Environment",
    severity: "HIGH",
    status: "pending",
    location: "Giridih",
    description: "Illegal stone quarrying operations in Birni block of Giridih have created massive dust clouds affecting 8 surrounding villages. Community health survey reveals 60% of adults over 40 have developed respiratory symptoms. No dust suppression measures in place. Quarrying happening without valid mining license.",
  },
  {
    title: "Forest encroachment by real estate developer destroying 200 acres near Netarhat",
    category: "Environment",
    severity: "HIGH",
    status: "in-progress",
    location: "Latehar",
    description: "A real estate developer is clearing 200 acres of reserved forest land near the famous Netarhat hill station in Latehar district using bulldozers. Tribal families living in the forest are being displaced. The local forest officer has reportedly issued no notice. Environmental NGOs have approached High Court.",
  },
  {
    title: "Burning of plastic waste by municipality creating toxic air in Chaibasa",
    category: "Environment",
    severity: "MEDIUM",
    status: "pending",
    location: "Chaibasa",
    description: "The Chaibasa municipality is burning collected plastic waste in open dumps on the outskirts of the city. Toxic fumes from burning plastics and medical waste are visible daily and causing eye irritation and breathing problems in nearby colonies. Proper landfill or recycling facility is needed.",
  },
  {
    title: "Vehicular air pollution exceeding permissible limits at Ranchi main market",
    category: "Environment",
    severity: "MEDIUM",
    status: "pending",
    location: "Ranchi",
    description: "Air quality monitoring at the main Ranchi market shows PM2.5 levels regularly exceeding 200 µg/m³ (limit: 60) during peak hours. Diesel generator use by shops during load-shedding worsens the situation. No odd-even traffic plan or pedestrian zone has been implemented despite multiple petitions.",
  },

  // ── Sanitation ────────────────────────────────────────────────────
  {
    title: "Garbage mountain 30 feet tall not cleared for 2 months near Bokaro bus stand",
    category: "Sanitation",
    severity: "CRITICAL",
    status: "pending",
    location: "Bokaro",
    description: "An illegal garbage dump near the Bokaro bus stand has grown to approximately 30 feet in height and spans 2,000 square meters. The dump has been untouched for 2 months. Stray dogs, rats and insects are breeding there. Smell permeates to residences 500 meters away. Two dengue cases have been traced nearby.",
  },
  {
    title: "Open defecation persisting near NHPC colony Dumka despite toilets built",
    category: "Sanitation",
    severity: "HIGH",
    status: "pending",
    location: "Dumka",
    description: "Despite 80 toilets being constructed under Swachh Bharat Mission near NHPC colony in Dumka, 40% are unused due to poor construction quality — no roof, broken doors and no water connections. Residents continue to defecate in the open near the river, risking waterborne disease outbreaks.",
  },
  {
    title: "Sewage flowing openly in residential street in Jamshedpur township",
    category: "Sanitation",
    severity: "HIGH",
    status: "in-progress",
    location: "Jamshedpur",
    description: "Overflow from a broken underground sewer line is creating an open sewage channel on Nildih Road in Jamshedpur for the past 3 weeks. Children wading through the sewage and foul smell affecting shops and homes. Three cases of skin infection have been reported from the locality.",
  },
  {
    title: "Hospital waste mixed with municipal garbage in Hazaribagh dump",
    category: "Sanitation",
    severity: "CRITICAL",
    status: "pending",
    location: "Hazaribagh",
    description: "Biomedical waste including used syringes, bandages and chemical containers from a private hospital in Hazaribagh is being illegally mixed with municipal solid waste at the town dump site. Rag-pickers, many of them children, are at high risk of needle-stick injuries and infection. CPCB biomedical waste rules are being violated.",
  },
  {
    title: "Public toilets near temple market in Deoghar locked and non-functional",
    category: "Sanitation",
    severity: "MEDIUM",
    status: "pending",
    location: "Deoghar",
    description: "Two newly constructed public toilet blocks near the Baidyanath Dham temple market in Deoghar have been padlocked for 3 months due to a dispute over maintenance responsibility between municipality and the temple trust. Thousands of daily pilgrims and market visitors have no toilet facility.",
  },

  // ── Energy ────────────────────────────────────────────────────────
  {
    title: "11 kV live wire fallen across school path in Pakur electrocution risk",
    category: "Energy",
    severity: "CRITICAL",
    status: "pending",
    location: "Pakur",
    description: "An 11,000 volt high-tension electrical wire snapped during a storm and is lying across the pathway used daily by 300 school children in Amrapara, Pakur district. The wire has been sparking intermittently. Parents have kept children home but the electricity department has not sent a repair team despite 2 days passing since the report.",
  },
  {
    title: "Load shedding 18 hours daily in Garhwa district disrupting life",
    category: "Energy",
    severity: "HIGH",
    status: "pending",
    location: "Garhwa",
    description: "Garhwa district is experiencing 18 hours of load shedding per day due to a burned sub-station transformer that has not been replaced in 3 weeks. Hospitals are relying on generators with rising fuel costs. Businesses have shut down. Milk dairy products are spoiling. JBVNL has made no announcement about restoration timeline.",
  },
  {
    title: "Transformer overloading causing fires in Koderma industrial cluster",
    category: "Energy",
    severity: "HIGH",
    status: "in-progress",
    location: "Koderma",
    description: "The distribution transformer serving the Koderma mica industrial cluster is operating at 180% of rated capacity causing heating and two small fires in the past month. Industries have protested but JBVNL has not upgraded the transformer. A major fire or explosion is feared if the overloading continues.",
  },
  {
    title: "Solar street lights procured under scheme non-functional in Ramgarh panchayat",
    category: "Energy",
    severity: "MEDIUM",
    status: "pending",
    location: "Ramgarh",
    description: "22 solar-powered street lights installed 8 months ago across 4 wards of Chitarpur panchayat in Ramgarh are not functioning. Battery backup depletes within 2 hours of switching on. The installing agency blames inferior battery quality. Panchayat has no budget to replace batteries. Streets remain dark at night.",
  },
  {
    title: "Electricity meter installed but no power supply connection given for 4 months in Godda",
    category: "Energy",
    severity: "MEDIUM",
    status: "pending",
    location: "Godda",
    description: "Under the Saubhagya scheme, electricity meters were installed in 60 BPL households in Pathna block of Godda district 4 months ago. Despite meters showing connection, no actual power supply has been given. Families have paid Rs. 500 connection fee each but are still using kerosene lamps.",
  },

  // ── Public Safety ─────────────────────────────────────────────────
  {
    title: "Crime surge in Ranchi's Lalpur area due to absence of night police patrol",
    category: "Public Safety",
    severity: "HIGH",
    status: "in-progress",
    location: "Ranchi",
    description: "Lalpur area in Ranchi has witnessed 12 chain-snatchings and 3 vehicle thefts in the past month. Residents report total absence of police patrol after 10 PM. The local police outpost is understaffed. Women are afraid to return home after evening shifts. Community watch groups have been formed out of desperation.",
  },
  {
    title: "Blind accident-prone curve on highway near Simdega claiming lives",
    category: "Public Safety",
    severity: "CRITICAL",
    status: "pending",
    location: "Simdega",
    description: "A sharp curve on NH-143 near Kolebira in Simdega district has been the site of 6 fatal accidents in 3 months. No warning signs, guard rails or crash barriers exist. The road is used by heavy mining trucks. Local villagers have placed stone cairns as improvised warning markers. Road safety board has not responded.",
  },
  {
    title: "Illegal liquor mafia operating openly in Sahebganj tribal village",
    category: "Public Safety",
    severity: "HIGH",
    status: "in-progress",
    location: "Sahebganj",
    description: "Illicit liquor manufacturing and sale is happening openly in several wards of Rajmahal in Sahebganj district. Tribal youths are the primary victims. Three deaths from hooch consumption have been reported in 2 months. Local police are allegedly complicit. The situation is leading to family violence and school dropouts.",
  },
  {
    title: "Unlit pedestrian subway flooding and shocking commuters in Jamshedpur",
    category: "Public Safety",
    severity: "HIGH",
    status: "pending",
    location: "Jamshedpur",
    description: "The pedestrian underpass near Bistupur market in Jamshedpur floods with 3 feet of water during rain and has a short-circuiting light fitting giving mild electric shocks to commuters wading through. Despite multiple complaints to the municipal corporation, no waterproofing or electrical repair has been done for 2 months.",
  },
  {
    title: "School child trafficking attempt reported near Gumla bus depot",
    category: "Public Safety",
    severity: "CRITICAL",
    status: "in-progress",
    location: "Gumla",
    description: "Three children were approached by unknown persons near the Gumla bus depot promising jobs in big cities. One child narrowly escaped what appears to be a trafficking attempt after alerting a shopkeeper. Parents have filed FIR but investigation is moving slowly. Area has no CCTV coverage. Child helpline awareness needed.",
  },

  // ── Transportation ────────────────────────────────────────────────
  {
    title: "Bus service to Netarhat hill station reduced to once a week causing isolation",
    category: "Transportation",
    severity: "HIGH",
    status: "pending",
    location: "Latehar",
    description: "Jharkhand State Road Transport Corporation (JSRTC) has reduced bus service to the popular Netarhat tourist destination in Latehar to once a week. Local residents including students, patients and daily workers are stranded. Shared autos charge 5x the bus fare. Tourism is also severely impacted.",
  },
  {
    title: "Traffic signal at 4 major crossings in Bokaro non-functional for 3 weeks",
    category: "Transportation",
    severity: "HIGH",
    status: "pending",
    location: "Bokaro",
    description: "Traffic signals at four major intersections in Bokaro Steel City sector 4, 6, 9 and 12 have been non-functional for 3 weeks. Peak hour traffic jams stretch up to 1 km. Without traffic police presence, road rage incidents and minor accidents are occurring daily. NHAI says it is not their jurisdiction.",
  },
  {
    title: "Railway level crossing at Seraikela manned gate removed causing accidents",
    category: "Transportation",
    severity: "CRITICAL",
    status: "pending",
    location: "Seraikela",
    description: "A manned railway level crossing in Ichagarh, Seraikela district was converted to an unmanned crossing six months ago as part of railway budget cuts. Two fatal accidents have occurred since then as vehicles cross without checking for approaching trains. Villagers demand restoration of gate keeper or installation of an underpass.",
  },
  {
    title: "Inter-district buses overcrowded and lack basic safety features in Palamu",
    category: "Transportation",
    severity: "MEDIUM",
    status: "pending",
    location: "Palamu",
    description: "Private buses operating on the Daltonganj to Ranchi inter-district route in Palamu are regularly ferrying 120+ passengers in buses certified for 52. No seatbelts, fire extinguishers or emergency exits in working condition. Multiple road transport authority complaints have yielded no inspections or fines.",
  },
  {
    title: "Broken bridge on rural link road cutting off 6 villages in Gumla for 2 months",
    category: "Transportation",
    severity: "HIGH",
    status: "in-progress",
    location: "Gumla",
    description: "A small bridge on the only road connecting 6 villages to the block headquarters in Gumla district collapsed 2 months ago during monsoon floods. 3,000 residents including schoolchildren and patients have no road connectivity. People cross a dangerous stream by foot. Government vehicles and emergency services cannot reach.",
  },
];

async function seedDatabase() {
  console.log("🔌 Connecting to MongoDB...");
  await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 10000 });
  console.log("✅ Connected!");

  // Find any existing user to assign as task creator
  const User = mongoose.model(
    "User",
    new mongoose.Schema({ name: String, email: String }, { strict: false })
  );
  const anyUser = await User.findOne({});
  if (!anyUser) {
    console.error("❌ No users found in DB. Please register at least one user first, then run this script.");
    process.exit(1);
  }
  console.log(`👤 Using existing user: ${anyUser.email || anyUser._id} as problem submitter`);

  let inserted = 0;
  let skipped = 0;

  for (const prob of PROBLEMS) {
    // Check if a task with this title already exists to avoid duplicates
    const exists = await Task.findOne({ title: prob.title });
    if (exists) {
      console.log(`  ⏭️  Skipping (already exists): ${prob.title.slice(0, 60)}`);
      skipped++;
      continue;
    }

    await Task.create({
      ...prob,
      user: anyUser._id,
      status: prob.status || "pending",
      aiAnalysis: {
        detectedCategory: prob.category,
        severity: prob.severity,
        impactLevel: prob.severity,
        summary: `This is a ${prob.category.toLowerCase()} issue in ${prob.location} with ${prob.severity} severity level.`,
        overallConfidence: 0.92,
        modelPipeline: "Seeded — ML Model (TF-IDF + Logistic Regression)",
      },
    });

    console.log(`  ✅ Inserted [${prob.severity}][${prob.category}]: ${prob.title.slice(0, 60)}`);
    inserted++;
  }

  console.log(`\n🎉 Done! ${inserted} problems inserted, ${skipped} skipped (already existed).`);
  await mongoose.disconnect();
}

seedDatabase().catch((err) => {
  console.error("❌ Seed failed:", err.message);
  process.exit(1);
});

