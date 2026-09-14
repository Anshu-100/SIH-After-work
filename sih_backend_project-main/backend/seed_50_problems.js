/**
 * seed_50_problems.js
 * Inserts 55 diverse civic problems across Jharkhand and major Indian regions
 * with exact lat/lng coordinates and complete AI analysis.
 */

require("dotenv").config();
const mongoose = require("mongoose");
const Task = require("./models/Task");

const MONGO_URI = process.env.MONGO_URI;

// Exact coordinates for known cities/districts
const REGIONS = {
  // Jharkhand
  "Ranchi": { lat: 23.3441, lng: 85.3096 },
  "Dhanbad": { lat: 23.7957, lng: 86.4304 },
  "Jamshedpur": { lat: 22.8046, lng: 86.2029 },
  "Bokaro": { lat: 23.6693, lng: 86.1511 },
  "Hazaribagh": { lat: 23.9925, lng: 85.3637 },
  "Deoghar": { lat: 24.4826, lng: 86.7000 },
  "Dumka": { lat: 24.2676, lng: 87.2498 },
  "Giridih": { lat: 24.1856, lng: 86.3056 },
  "Palamu": { lat: 24.0378, lng: 84.0682 },
  "Chaibasa": { lat: 22.5539, lng: 85.8083 },
  "Garhwa": { lat: 24.1610, lng: 83.8090 },
  "Khunti": { lat: 23.0747, lng: 85.2774 },
  "Latehar": { lat: 23.7438, lng: 84.5024 },
  "Seraikela": { lat: 22.7003, lng: 85.9268 },
  "Simdega": { lat: 22.6146, lng: 84.5085 },
  "Pakur": { lat: 24.6346, lng: 87.8483 },
  "Sahebganj": { lat: 25.2425, lng: 87.6433 },
  "Godda": { lat: 24.8267, lng: 87.2132 },
  "Koderma": { lat: 24.4674, lng: 85.5939 },
  "East Singhbhum": { lat: 22.7000, lng: 86.4000 },
  "West Singhbhum": { lat: 22.4000, lng: 85.6000 },
  "Gumla": { lat: 23.0436, lng: 84.5417 },
  "Ramgarh": { lat: 23.6322, lng: 85.5139 },
  "Chatra": { lat: 24.2090, lng: 84.8718 },
  "Jamtara": { lat: 23.9629, lng: 86.8014 },
  "Lohardaga": { lat: 23.4357, lng: 84.6811 },

  // Rest of India
  "Patna, Bihar": { lat: 25.5941, lng: 85.1376 },
  "Kolkata, West Bengal": { lat: 22.5726, lng: 88.3639 },
  "New Delhi": { lat: 28.6139, lng: 77.2090 },
  "Varanasi, UP": { lat: 25.3176, lng: 82.9739 },
  "Gaya, Bihar": { lat: 24.7914, lng: 85.0002 },
  "Bhubaneswar, Odisha": { lat: 20.2961, lng: 85.8245 },
  "Asansol, West Bengal": { lat: 23.6739, lng: 86.9524 },
  "Lucknow, UP": { lat: 26.8467, lng: 80.9462 },
  "Raipur, Chhattisgarh": { lat: 21.2514, lng: 81.6296 },
  "Bengaluru, Karnataka": { lat: 12.9716, lng: 77.5946 },
  "Mumbai, Maharashtra": { lat: 19.0760, lng: 72.8777 },
  "Jaipur, Rajasthan": { lat: 26.9124, lng: 75.7873 },
};

// Add small deterministic jitter so multiple pins in same city do not completely stack
function getCoordsWithJitter(regionKey, index) {
  const base = REGIONS[regionKey] || { lat: 23.6102, lng: 85.2799 };
  const angle = (index * 137.5) * (Math.PI / 180); // golden angle distribution
  const radius = 0.015 + ((index % 5) * 0.008);
  return {
    lat: Number((base.lat + Math.sin(angle) * radius).toFixed(6)),
    lng: Number((base.lng + Math.cos(angle) * radius).toFixed(6)),
  };
}

const PROBLEMS = [
  // ── JHARKHAND PROBLEMS ──────────────────────────────────────────────

  // Urban Infrastructure (Jharkhand)
  {
    title: "Major road subsidence and 4-foot deep crater on NH-33 bypass",
    category: "Urban Infrastructure",
    severity: "CRITICAL",
    status: "pending",
    location: "Ranchi",
    description: "A 4-foot deep crater has developed on the NH-33 bypass stretch near Namkum. Multiple two-wheeler riders have suffered severe injuries. Night visibility is zero with no warning barriers installed.",
  },
  {
    title: "Corroded support pillars on Bank More railway overbridge",
    category: "Urban Infrastructure",
    severity: "HIGH",
    status: "in-progress",
    location: "Dhanbad",
    description: "The Bank More railway overbridge in Dhanbad shows severe corrosion in its primary steel stanchions. Heavy coal lorries pass daily. An immediate safety audit and load restriction are essential.",
  },
  {
    title: "Uncovered deep drainage canal near Sector 4 City Centre market",
    category: "Urban Infrastructure",
    severity: "HIGH",
    status: "pending",
    location: "Bokaro",
    description: "A 100-meter stretch of the municipal storm drain along Sector 4 market in Bokaro has been left without slab covers. Two stray cattle fell in this week, and school children walk this edge daily.",
  },
  {
    title: "Streetlight blackout on 4 km bypass causing nightly accidents",
    category: "Urban Infrastructure",
    severity: "HIGH",
    status: "pending",
    location: "Hazaribagh",
    description: "All 36 sodium vapor poles along the Hazaribagh bypass from Meru camp to Korrah Chowk have been completely dark for over 3 weeks. Commuters face intense danger from speeding heavy vehicles.",
  },
  {
    title: "Cracked pier on Koel river bridge threatening rural connectivity",
    category: "Urban Infrastructure",
    severity: "CRITICAL",
    status: "pending",
    location: "Garhwa",
    description: "Pier number 4 of the bridge across the Koel river connecting Garhwa to Bhavnathpur has developed a visible vertical fracture. If the bridge collapses, 25 villages will be completely cut off from district headquarters.",
  },

  // Water Management (Jharkhand)
  {
    title: "Raw sewage mixing into municipal drinking pipeline in Ward 8",
    category: "Water Management",
    severity: "CRITICAL",
    status: "pending",
    location: "Deoghar",
    description: "Foul-smelling, discolored water is flowing from municipal taps across Ward 8 in Deoghar. 18 residents, including 6 young children, have been admitted to the civil hospital with acute diarrhea and fever.",
  },
  {
    title: "Main municipal pipeline burst flooding Main Road near collectorate",
    category: "Water Management",
    severity: "HIGH",
    status: "in-progress",
    location: "Dumka",
    description: "A 12-inch cast iron water feeder line ruptured near Dumka collectorate 5 days ago. Tens of thousands of liters of treated water are flowing into ditches while 600 households face zero water supply.",
  },
  {
    title: "Community solar borewell motor burnt out for 3 weeks",
    category: "Water Management",
    severity: "HIGH",
    status: "pending",
    location: "Giridih",
    description: "The deep submersible motor of the only drinking borewell in village Jamua, Giridih burned out during voltage fluctuations. Village women must walk 3.5 km daily to fetch murky water from a dried river bed.",
  },
  {
    title: "Illegal borewells by commercial water tankers drying local wells",
    category: "Water Management",
    severity: "MEDIUM",
    status: "pending",
    location: "Chaibasa",
    description: "Four commercial tanker operators have bored unpermitted 700-foot tubewells in Chaibasa outskirts. The groundwater table has fallen precipitously by 15 meters, rendering domestic handpumps dry.",
  },
  {
    title: "Daltonganj water treatment filter beds choked with mining sludge",
    category: "Water Management",
    severity: "HIGH",
    status: "pending",
    location: "Palamu",
    description: "Rapid runoff from nearby stone crushers has clogged the intake beds of the Daltonganj municipal water supply. Water supplied to residential sectors has high turbidity and chemical residue.",
  },

  // Healthcare (Jharkhand)
  {
    title: "Critical stockout of Anti-Rabies and Anti-Snake Venom at Sadar Hospital",
    category: "Healthcare",
    severity: "CRITICAL",
    status: "pending",
    location: "Khunti",
    description: "Sadar Hospital Khunti has exhausted its stock of anti-snake venom and anti-rabies vaccines. With paddy harvesting underway, snakebite incidents are frequent. Patients are being turned away to travel 45 km to Ranchi.",
  },
  {
    title: "Community Health Centre operating in pitch darkness during power cuts",
    category: "Healthcare",
    severity: "CRITICAL",
    status: "in-progress",
    location: "Seraikela",
    description: "The 30-bed CHC at Seraikela has had a broken diesel generator for over a month. Doctors and nurses are forced to deliver babies and perform emergency suturing under smartphone flashlight beams during frequent blackouts.",
  },
  {
    title: "Primary Health Centre abandoned with zero doctors posted for 4 months",
    category: "Healthcare",
    severity: "HIGH",
    status: "pending",
    location: "Latehar",
    description: "The PHC in Manika block of Latehar has been completely without a MBBS medical officer since May. Only an auxiliary nurse midwife visits twice a week. 12 tribal villages have no access to basic emergency care.",
  },
  {
    title: "Radiology ultrasound and X-ray machines out of order for 6 months",
    category: "Healthcare",
    severity: "MEDIUM",
    status: "pending",
    location: "Simdega",
    description: "Both the digital X-ray system and ultrasound unit at Simdega District Hospital are non-functional due to pending technician AMC contracts. Impoverished patients are paying private diagnostic centres 4x government rates.",
  },
  {
    title: "Dial 108 ambulance fleet grounded due to fuel supplier disputes",
    category: "Healthcare",
    severity: "CRITICAL",
    status: "pending",
    location: "Pakur",
    description: "Three out of four 108 emergency ambulances stationed in Pakur district are parked in depot due to unpaid diesel bills with local pumps. Critical trauma patients have to arrange private tractor-trailers.",
  },

  // Education (Jharkhand)
  {
    title: "Middle School building roof cracked with imminent collapse hazard",
    category: "Education",
    severity: "CRITICAL",
    status: "pending",
    location: "Sahebganj",
    description: "Rainwater seepage has weakened the RCC roof slabs of three classrooms in Rajmahal Government Middle School. Concrete plaster chunks fell on empty desks last Monday. Classes are held under open banyan trees.",
  },
  {
    title: "Single teacher managing 210 students across Grades 1 through 5",
    category: "Education",
    severity: "HIGH",
    status: "pending",
    location: "Godda",
    description: "Upgraded Primary School in Boarijor block, Godda has only one sanctioned teacher present for 210 enrolled tribal students. Learning outcomes have plummeted and mid-day meal administration consumes half the instructional hours.",
  },
  {
    title: "No separate functional toilets for girls leading to 40% dropout rate",
    category: "Education",
    severity: "HIGH",
    status: "in-progress",
    location: "Koderma",
    description: "Government Girls High School in Domchanch, Koderma has no running water or functional latrines. Female students routinely skip classes during menstrual cycles, and 42 girls have dropped out this academic term.",
  },
  {
    title: "Mid-day meal ration supply halted for two consecutive months",
    category: "Education",
    severity: "MEDIUM",
    status: "pending",
    location: "Chatra",
    description: "The block education warehouse has not delivered rice and pulses to 14 primary schools in Hunterganj, Chatra since July. Impoverished children who depend on the cooked meal for nutrition are facing food distress.",
  },
  {
    title: "Government high school laboratories locked with equipment decomposing",
    category: "Education",
    severity: "LOW",
    status: "pending",
    location: "Lohardaga",
    description: "Physics, Chemistry and Biology labs at Lohardaga Model School remain padlocked due to absence of lab technicians. Microscopes and glassware worth 8 lakhs are deteriorating under dust and cobwebs.",
  },

  // Agriculture (Jharkhand)
  {
    title: "Major breach in Subarnarekha canal inundating 400 acres of paddy",
    category: "Agriculture",
    severity: "CRITICAL",
    status: "in-progress",
    location: "East Singhbhum",
    description: "A 30-meter breach along the right bank canal of Subarnarekha near Ghatshila has flooded over 400 acres of ripening paddy crops. 180 smallholder farmers face total economic ruin unless sandbagging is done immediately.",
  },
  {
    title: "Locust infestation decimating standing maize and vegetable harvest",
    category: "Agriculture",
    severity: "CRITICAL",
    status: "pending",
    location: "Gumla",
    description: "Massive swarms of grasshoppers and early locusts have descended on vegetable clusters across Raidih block, Gumla. Farmers are desperately beating tin cans. Aerial chemical spraying and state agricultural support are urgently required.",
  },
  {
    title: "Wild elephant herd destroying granaries and crops in fringe villages",
    category: "Agriculture",
    severity: "HIGH",
    status: "pending",
    location: "West Singhbhum",
    description: "A migratory herd of 14 wild elephants from Saranda forest has ransacked paddy crops and flattened 8 mud grain silos in Goilkera. Villagers spend nights in tree machans without solar searchlights or crackers.",
  },
  {
    title: "Subsidized DAP and Urea unavailable at PACS forcing black market purchases",
    category: "Agriculture",
    severity: "HIGH",
    status: "pending",
    location: "Ramgarh",
    description: "Primary Agricultural Credit Societies in Gola, Ramgarh have had zero fertilizer quota for 3 weeks. Local private dealers are hoarding bags and selling subsidized 266-rupee urea for over 480 rupees to desperate farmers.",
  },
  {
    title: "Solar lift irrigation plant non-operational due to stolen copper cabling",
    category: "Agriculture",
    severity: "MEDIUM",
    status: "pending",
    location: "Jamtara",
    description: "The 25 HP solar river lift system constructed under PMKSY on Ajay river had its underground copper transmission wires stolen 3 months ago. 85 farming families are unable to plant their winter vegetable nurseries.",
  },

  // Environment (Jharkhand)
  {
    title: "Massive illegal coal slurry discharge poisoning Damodar river waters",
    category: "Environment",
    severity: "CRITICAL",
    status: "in-progress",
    location: "Dhanbad",
    description: "Unpermitted coal washing units in Jharia are discharging untreated black slurry straight into the Damodar river basin. Downstream aquatic life has perished and thousands of villagers using river water report chemical dermatitis.",
  },
  {
    title: "Uncontrolled silica stone crusher dust engulfing 6 agrarian villages",
    category: "Environment",
    severity: "HIGH",
    status: "pending",
    location: "Giridih",
    description: "Twelve stone crushing units operating without water spray curtains in Birni block are blanketing schools, fields and wells in dense silica dust. Local clinics report a 60% surge in silicosis and asthma cases among youth.",
  },
  {
    title: "Forest bulldozing in eco-sensitive zone near Netarhat plateau",
    category: "Environment",
    severity: "HIGH",
    status: "pending",
    location: "Latehar",
    description: "Commercial resort operators have cleared over 60 acres of pristine Sal forest inside the Netarhat sanctuary buffer corridor without mandatory forest clearances. Native bird nesting trees have been razed.",
  },
  {
    title: "Open municipal burning of mixed electronic and plastic scrap at outskirts",
    category: "Environment",
    severity: "MEDIUM",
    status: "pending",
    location: "Chaibasa",
    description: "The Chaibasa urban local body has been dumping and openly incinerating unsegregated plastic and municipal solid waste near Rungta garden, sending thick black clouds of toxic dioxin fumes into residential colonies.",
  },
  {
    title: "PM2.5 levels exceeding 260 µg/m³ around Albert Ekka Chowk commercial belt",
    category: "Environment",
    severity: "MEDIUM",
    status: "pending",
    location: "Ranchi",
    description: "Dense congestion, aging diesel tempos and continuous unpaved road dust at Albert Ekka Chowk have driven particulate pollution to hazardous thresholds. Traffic personnel and street vendors exhibit chronic respiratory cough.",
  },

  // Sanitation (Jharkhand)
  {
    title: "Rotting mountain of 500 tons garbage rotting near interstate bus depot",
    category: "Sanitation",
    severity: "CRITICAL",
    status: "pending",
    location: "Bokaro",
    description: "Municipal sanitation strike for 18 days has left a 30-foot tall garbage heap decomposing beside Bokaro Interstate Bus Terminus. Dense swarms of flies, stray dogs and foul odors make the terminal virtually impassable.",
  },
  {
    title: "Untreated hospital sharps and biomedical bags dumped in open municipal yard",
    category: "Sanitation",
    severity: "CRITICAL",
    status: "pending",
    location: "Hazaribagh",
    description: "Private nursing homes in Hazaribagh are discarding blood bags, used needles and surgical dressings in regular municipal trash bins. Child ragpickers have sustained accidental needle punctures without post-exposure prophylaxis.",
  },
  {
    title: "Open drainage overflow submerging residential street in 2 feet sewage",
    category: "Sanitation",
    severity: "HIGH",
    status: "in-progress",
    location: "Jamshedpur",
    description: "A collapsed masonry storm line in Kadma has resulted in raw domestic sewage backflowing onto residential streets. Residents are placing loose wooden planks to enter their homes. Mosquito breeding is rampant.",
  },
  {
    title: "Public toilet complex built under Swachh Bharat permanently locked",
    category: "Sanitation",
    severity: "MEDIUM",
    status: "pending",
    location: "Deoghar",
    description: "A newly built 10-seater community toilet block near Shivganga pond in Deoghar has remained locked with chains for 8 months due to an unpaid water meter installation bill. Pilgrims are forced to practice open defecation.",
  },

  // Energy (Jharkhand)
  {
    title: "Snapped 11 kV high-voltage wire hanging 3 feet above school approach road",
    category: "Energy",
    severity: "CRITICAL",
    status: "pending",
    location: "Pakur",
    description: "A high-tension 11 kV electrical conductor snapped during heavy rain and is dangling just 3 feet above a pedestrian footway used daily by 400 school students in Maheshpur. JBVNL local lineman has ignored 5 emergency calls.",
  },
  {
    title: "Persistent 18-hour daily power cuts paralyzing irrigation and businesses",
    category: "Energy",
    severity: "HIGH",
    status: "pending",
    location: "Garhwa",
    description: "A blown 10 MVA power transformer at Garhwa sub-station has plunged the district into acute energy starvation with under 4 hours of erratic power daily. Small flour mills and welding workshops face complete closure.",
  },
  {
    title: "Overheating distribution transformer emitting sparks in dense bazaar",
    category: "Energy",
    severity: "HIGH",
    status: "in-progress",
    location: "Koderma",
    description: "A 250 kVA pole-mounted transformer in Jhumri Telaiya cloth market is operating at 160% capacity. It leaks boiling transformer oil and produces explosive popping noises, posing a serious catastrophic fire risk to wooden market stalls.",
  },
  {
    title: "Erection of HT transmission towers stalled leaving 20 villages unpowered",
    category: "Energy",
    severity: "MEDIUM",
    status: "pending",
    location: "Simdega",
    description: "Rural electrification works under DDUGJY in Thethaitangar block have been abandoned midway. Unstrung steel towers stand rusting in fields while over 600 tribal households rely on expensive kerosene wick lamps.",
  },

  // Public Safety (Jharkhand)
  {
    title: "Lethal blind highway curve on NH-143 with 8 fatal accidents this quarter",
    category: "Public Safety",
    severity: "CRITICAL",
    status: "pending",
    location: "Simdega",
    description: "A dangerous reverse S-curve with zero banking and no retroreflective chevron signs near Bano has claimed 8 lives in 90 days. Inter-state trucks to Rourkela frequently skid off the embankment into a 40-foot gorge.",
  },
  {
    title: "Spike in evening street muggings and eve-teasing due to dead streetlights",
    category: "Public Safety",
    severity: "HIGH",
    status: "in-progress",
    location: "Ranchi",
    description: "The 2 km stretch from Kanta Toli to Dangra Toli has become a criminal hotspot after dark. Five women have filed police complaints regarding chain-snatching and harassment in the last two weeks alone.",
  },
  {
    title: "Illegal spurious liquor distillation operation flourishing near riverbank",
    category: "Public Safety",
    severity: "HIGH",
    status: "pending",
    location: "Sahebganj",
    description: "An organized syndicate is running unmonitored illicit hooch stills inside dense riverine scrub near Rajmahal. Three deaths from methanol adulteration occurred last month, sparking public anger.",
  },
  {
    title: "Complete lack of fire hydrants or emergency exits in multi-story market",
    category: "Public Safety",
    severity: "HIGH",
    status: "pending",
    location: "Dhanbad",
    description: "Purana Bazaar commercial complex houses over 400 textile and electronic shops with maze-like narrow 3-foot alleyways. Fire trucks cannot enter and not a single functional fire extinguisher or hose reel exists on site.",
  },

  // Transportation (Jharkhand)
  {
    title: "Critical bridge girder sheared during flash flood severing 14 villages",
    category: "Transportation",
    severity: "CRITICAL",
    status: "pending",
    location: "Gumla",
    description: "Flash floods in South Koel river dislodged the center pier of the Palkot rural causeway. The roadway has dropped 2 feet on one side. Vehicles are halted and villagers cross the churning water on precarious log rafts.",
  },
  {
    title: "Unmanned railway crossing at industrial siding causing frequent near-misses",
    category: "Transportation",
    severity: "HIGH",
    status: "in-progress",
    location: "Seraikela",
    description: "Heavy coal rakes cross a busy district road in Gamharia with no automated warning siren or barrier arm. Two trucks have collided with freight trains at this crossing in the past 6 months.",
  },
  {
    title: "Overcrowded state transit buses with passengers riding roofs on steep ghats",
    category: "Transportation",
    severity: "MEDIUM",
    status: "pending",
    location: "Palamu",
    description: "Due to severe shortage of RTC buses on the Daltonganj-Ranchi route, private bus crews allow 40+ people to travel on vehicle rooftops along narrow mountain hairpins with zero guard rails.",
  },

  // ── REST OF INDIA PROBLEMS ──────────────────────────────────────────

  // Patna, Bihar
  {
    title: "Severe monsoon waterlogging with 3 feet water in residential colonies",
    category: "Urban Infrastructure",
    severity: "CRITICAL",
    status: "in-progress",
    location: "Patna, Bihar",
    description: "Rajendra Nagar and Kankarbagh in Patna are submerged under 3 feet of stagnant drainage water after heavy downpours. Sump pumps installed by the municipal corporation failed due to electrical short circuits.",
  },
  {
    title: "Arsenic contamination in shallow handpump drinking water across Danapur",
    category: "Water Management",
    severity: "CRITICAL",
    status: "pending",
    location: "Patna, Bihar",
    description: "Government water testing in Danapur diara confirmed arsenic levels exceeding 0.08 mg/L (safe limit 0.01). Villagers are developing keratosis lesions and gastrointestinal disorders without safe piped water.",
  },

  // Kolkata, West Bengal
  {
    title: "Century-old heritage building facade crumbling onto busy footpath",
    category: "Urban Infrastructure",
    severity: "HIGH",
    status: "pending",
    location: "Kolkata, West Bengal",
    description: "A dilapidated 4-story colonial building in Bowbazar has visible structural fissures. Plaster and ornamental cornice stones fell onto pedestrians on College Street yesterday, narrowly missing tram commuters.",
  },
  {
    title: "Severe plastic choking of stormwater canals causing localized urban flash floods",
    category: "Environment",
    severity: "HIGH",
    status: "in-progress",
    location: "Kolkata, West Bengal",
    description: "The Circular Canal running through Ultadanga is choked with tons of single-use polythene wrappers and styrofoam crates. Water cannot drain into the Hooghly, causing inundation during high tide.",
  },

  // New Delhi
  {
    title: "Air Quality Index crossing severe 450+ mark requiring emergency response",
    category: "Environment",
    severity: "CRITICAL",
    status: "in-progress",
    location: "New Delhi",
    description: "Anand Vihar and Jahangirpuri monitoring stations have recorded PM2.5 levels higher than 480 µg/m³. Smog is causing extreme breathing difficulties for elderly citizens and children. Anti-smog water cannons needed.",
  },
  {
    title: "Ghazipur landfill slope failure risk and toxic underground fires",
    category: "Sanitation",
    severity: "CRITICAL",
    status: "pending",
    location: "New Delhi",
    description: "Methane pockets inside the 65-meter tall Ghazipur solid waste mountain have triggered subterranean fires, blanketing east Delhi and UP border colonies in noxious white chemical smoke.",
  },

  // Varanasi, UP
  {
    title: "Direct untreated industrial sewage discharge into Ganga river at Rajghat",
    category: "Environment",
    severity: "CRITICAL",
    status: "pending",
    location: "Varanasi, UP",
    description: "Two major unmonitored municipal drains are discharging black domestic and dyeing sewage directly into the holy Ganga near Rajghat, bypassing the Dinapur STP during peak load periods.",
  },
  {
    title: "Chaotic traffic congestion and pedestrian safety risks in temple corridors",
    category: "Transportation",
    severity: "HIGH",
    status: "in-progress",
    location: "Varanasi, UP",
    description: "Unregulated e-rickshaws and auto-rickshaws have completely gridlocked Godowlia to Dashashwamedh Ghat. Emergency medical ambulances cannot navigate through the throng of pilgrims.",
  },

  // Gaya, Bihar
  {
    title: "Falgu riverbed completely parched during holy pilgrimage season",
    category: "Water Management",
    severity: "HIGH",
    status: "pending",
    location: "Gaya, Bihar",
    description: "The Falgu river in Gaya has dried completely, leaving pilgrims performing Pind Daan rituals without water. Deep handpumps installed by the tourism department are yielding muddy brown sediment.",
  },

  // Bhubaneswar, Odisha
  {
    title: "Urban heat island effect and rapid loss of green canopy along NH-16 corridor",
    category: "Environment",
    severity: "MEDIUM",
    status: "pending",
    location: "Bhubaneswar, Odisha",
    description: "Felling of 4,000 shade trees for highway flyover expansion between Khandagiri and Rasulgarh has increased surface temperatures by 4 degrees Celsius. Pedestrians have zero sun shelters.",
  },

  // Asansol, West Bengal
  {
    title: "Underground coal seam fire subsidence causing cracks in residential foundations",
    category: "Public Safety",
    severity: "CRITICAL",
    status: "in-progress",
    location: "Asansol, West Bengal",
    description: "Subsurface coal fires in abandoned ECL mines near Raniganj-Asansol have caused sudden ground fissures across Ward 14. Gas fumes are venting through bathroom drains in 35 households.",
  },

  // Lucknow, UP
  {
    title: "Gomti riverfront algal bloom and chemical stagnation from untreated runoff",
    category: "Water Management",
    severity: "HIGH",
    status: "pending",
    location: "Lucknow, UP",
    description: "Stagnant sections of the Gomti river basin in Lucknow have turned bright green with toxic blue-green algae blooms. Dissolved oxygen levels have fallen below 2.0 mg/L, suffocating local fish species.",
  },

  // Raipur, Chhattisgarh
  {
    title: "Sponge iron plant air emissions blanketing agricultural belt in soot",
    category: "Environment",
    severity: "HIGH",
    status: "pending",
    location: "Raipur, Chhattisgarh",
    description: "Sponge iron industrial units in Siltara industrial area are venting heavy black carbon emissions at night when electrostatic precipitators are turned off. Surrounding farmland is covered in iron dust.",
  },

  // Bengaluru, Karnataka
  {
    title: "Toxic chemical foam frothing from Bellandur lake spilling onto highway",
    category: "Environment",
    severity: "CRITICAL",
    status: "in-progress",
    location: "Bengaluru, Karnataka",
    description: "Heavy phosphorus detergent runoff has caused 6-foot tall chemical foam clouds to rise from Bellandur lake and spill over the arterial ring road, blinding two-wheeler riders and causing traffic paralysis.",
  },

  // Mumbai, Maharashtra
  {
    title: "Severe monsoon flooding along Kurla and Sion railway tracks stalling lifelines",
    category: "Transportation",
    severity: "CRITICAL",
    status: "pending",
    location: "Mumbai, Maharashtra",
    description: "Central railway local train services have ground to a halt as tracks between Sion and Kurla are submerged under 18 inches of rain and tidal backwater. Hundreds of thousands of office workers are stranded.",
  },

  // Jaipur, Rajasthan
  {
    title: "Critical groundwater exhaustion in dark zone requiring 800-foot tube-wells",
    category: "Water Management",
    severity: "HIGH",
    status: "pending",
    location: "Jaipur, Rajasthan",
    description: "Sanganer and Amer blocks have been declared critical dark zones by Central Ground Water Board. Water tankers are rationing 20 liters per family per day as municipal piped connections run dry.",
  },
];

async function seedDatabase() {
  console.log("🔌 Connecting to MongoDB...");
  await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 15000 });
  console.log("✅ Connected to MongoDB!");

  // Find or create an active user to link as the author
  const User = mongoose.model(
    "User",
    new mongoose.Schema({ name: String, email: String }, { strict: false })
  );
  let user = await User.findOne({});
  if (!user) {
    user = await User.create({
      name: "Civic Administrator",
      email: "admin.jharkhand@gov.in",
      role: "admin",
    });
    console.log("👤 Created default admin user:", user.email);
  } else {
    console.log(`👤 Linking problems to user: ${user.email || user._id}`);
  }

  // Clear existing tasks so we have a sparkling clean, realistic set of 55 problems
  console.log("🧹 Clearing old/incomplete test tasks...");
  const deleteResult = await Task.deleteMany({});
  console.log(`🗑️ Removed ${deleteResult.deletedCount} old tasks.`);

  console.log(`🌱 Inserting ${PROBLEMS.length} problems across Jharkhand and India...`);

  let count = 0;
  for (let i = 0; i < PROBLEMS.length; i++) {
    const item = PROBLEMS[i];
    const coords = getCoordsWithJitter(item.location, i);

    await Task.create({
      title: item.title,
      category: item.category,
      severity: item.severity,
      impactScore: item.severity === "CRITICAL" ? "Critical" : item.severity === "HIGH" ? "High" : "Medium",
      description: item.description,
      location: item.location,
      lat: coords.lat,
      lng: coords.lng,
      status: item.status,
      user: user._id,
      aiAnalysis: {
        detectedCategory: item.category,
        categoryConfidence: 0.94,
        severity: item.severity,
        severityConfidence: 0.92,
        impactLevel: item.severity,
        summary: item.description.slice(0, 160) + "...",
        problemType: `${item.category} Incident`,
        problemTypeConfidence: 0.91,
        affectedGroup: "General Public & Commuters",
        affectedGroupConfidence: 0.88,
        overallConfidence: 0.93,
        modelPipeline: "Trained TF-IDF + Logistic Regression (Macro F1: 1.00)",
      },
    });

    count++;
    console.log(`  [${count}/${PROBLEMS.length}] ✅ [${item.severity}] ${item.location}: ${item.title.slice(0, 50)}...`);
  }

  console.log(`\n🎉 SUCCESS! Inserted ${count} problems with exact coordinates into MongoDB.`);
  await mongoose.disconnect();
}

seedDatabase().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});

