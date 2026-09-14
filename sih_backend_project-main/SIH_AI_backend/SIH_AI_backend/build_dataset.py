"""
Expanded Dataset Builder for Civic Complaints
Generates 500+ realistic, high-diversity civic complaints covering all 10 categories
and 4 severity ratings (LOW, MEDIUM, HIGH, CRITICAL).
Includes realistic variations: locations, urgency phrasing, infrastructure problems,
health emergencies, agricultural distress, public hazards, and civic breakdown.
"""

import os
import random
import pandas as pd

random.seed(42)

# Templates & Patterns per category
CATEGORY_DATA = {
    "Water Management": {
        "CRITICAL": [
            "Drinking water contaminated with industrial chemical waste, dozens hospitalized with severe poisoning in {loc}.",
            "Main municipal water pipeline exploded on {road}, flooding residential homes and cutting supply to {count} families.",
            "Complete groundwater depletion in {loc}, borewells pumping sand, emergency relief tankers urgently needed.",
            "Water storage reservoir wall cracked and threatening to submerge adjacent village {loc}.",
            "Dead animal carcass found decaying inside the community drinking water overhead tank in {loc}.",
            "Cholera and severe gastroenteritis outbreak reported due to sewage mixing in drinking water pipelines in {loc}.",
            "Drinking water supply poisoned due to pesticide tank leakage near local water pump house.",
            "Arsenic and fluoride contamination in handpumps causing skeletal deformities in rural {loc}.",
            "Water pipeline breach drowned three cows and flooded electrical sub-station near {road}."
        ],
        "HIGH": [
            "No tap water supply in {loc} for past {days} days, residents forced to purchase private tankers at huge rates.",
            "Submersible pump at community borewell completely burned out, leaving entire village {loc} without drinking water.",
            "Water smells strongly like foul drainage water and looks muddy black from municipal connection in {loc}.",
            "Main feeder water line ruptured by telecom JCB digging along {road}, continuous massive water wastage.",
            "Water supply in {loc} restricted to only 15 minutes once in 3 days, causing violent disputes at community taps.",
            "Primary school and anganwadi center in {loc} has non-functional water taps for {days} days.",
            "Damaged sluice valve cutting drinking water supply to entire commercial and residential district in {loc}.",
            "Community public RO purification plant in {loc} broken down for {days} weeks, no technician attending.",
            "Severe shortage of water tankers in drought-prone block {loc} despite multiple registered complaints."
        ],
        "MEDIUM": [
            "Underground pipe leak causing clean drinking water to pool on the street near {road}.",
            "Scheduled municipal water tanker delayed by more than 24 hours in ward {num} of {loc}.",
            "Illegal booster pumps installed by several residents in {loc} causing zero water pressure in neighboring homes.",
            "Water supply timing in {loc} changed abruptly to 2 AM without prior public notice.",
            "Water filter unit at municipal dispensary in {loc} requires urgent membrane replacement.",
            "Leakage in water meter junction wasting thousands of liters daily outside house in {loc}.",
            "Community water tap handle rusted and broken, water dripping continuously in {loc}."
        ],
        "LOW": [
            "Water pressure in bathroom taps is very low on upper floors in apartment complex {loc}.",
            "Slight brownish discoloration noticed in morning tap water for past two days in {loc}.",
            "Public drinking fountain near park in {loc} has a slow leaky washer.",
            "Water bill received has higher meter reading than actual consumption in {loc}.",
            "Requesting installation of an additional community water tap near the new bus stop in {loc}.",
            "Water meter glass cloudy and hard to read at property in {loc}."
        ]
    },

    "Urban Infrastructure": {
        "CRITICAL": [
            "Major highway bridge over river has developed structural cracks, concrete chunks falling into river near {loc}.",
            "Open uncovered manhole on unlit road of {road} resulted in motorcycle rider falling in and suffering critical head injury.",
            "Massive landslide and retaining wall collapse blocked state highway {road}, trapping vehicles under debris.",
            "Highway flyover expansion joint widened by 6 inches, vibrating violently under vehicular movement in {loc}.",
            "Crater-sized deep pothole on fast lane of {road} caused three consecutive car rollover accidents last night.",
            "Pedestrian subway flooded with 5 feet of stormwater and live electrical wires submerged in water.",
            "Old multi-story commercial market balcony collapsed onto busy pedestrian footpath in {loc}.",
            "Sinkhole formed suddenly in the middle of intersection near {loc}, engulfing front of a delivery truck."
        ],
        "HIGH": [
            "Dangerous potholes covering entire 5 km stretch of {road}, making emergency ambulance transit impossible.",
            "Footbridge over railway tracks in {loc} has severely rusted corroded pillars shaking in wind.",
            "Main storm drain culvert collapsed under truck weight, half the road completely severed in {loc}.",
            "All streetlights on main ring road {road} non-functional for past {days} days, high accident danger.",
            "Road excavated for sewage pipeline 4 months ago left unpaved, mud and dust causing daily skidding in {loc}.",
            "Overhead directional signage metal frame detached and swinging dangerously over traffic on {road}.",
            "Divider break on fast expressway in {loc} causing tractors and two-wheelers to drive on wrong side."
        ],
        "MEDIUM": [
            "Unmarked and unpainted speed breaker on {road} without reflectors, vehicles violently jumping.",
            "Footpath paving blocks broken and dislodged, forcing school students to walk in traffic in {loc}.",
            "Traffic signals at four-way junction on {road} blinking yellow continuously causing vehicle gridlocks.",
            "Street signboards fallen down and lying in ditch near entrance of {loc}.",
            "Rainwater pooling at street corner due to faulty road gradient on {road} in {loc}."
        ],
        "LOW": [
            "Street name board in ward {num} of {loc} is rusted and illegible.",
            "Minor cracks appearing on walking promenade footpath in public park at {loc}.",
            "Request for zebra crossing painting outside primary school gate in {loc}.",
            "Pavement curbs need repainting in reflective yellow paint along {road}.",
            "Decorative street light poles in park {loc} have missing decorative glass covers."
        ]
    },

    "Healthcare": {
        "CRITICAL": [
            "Anti-rabies and anti-snake venom emergency injections completely out of stock in district hospital {loc}.",
            "ICU backup oxygen cylinder supply failed during power cut in sub-divisional hospital {loc}.",
            "Government ambulance dial 108 helpline not answering, pregnant patient died en route in {loc}.",
            "Acute dengue and viral encephalitis outbreak claiming lives of children in {loc}, immediate medical team required.",
            "Hospital blood bank has zero units of all blood groups during emergency accident influx in {loc}.",
            "Fake and counterfeit antibiotics distributed through government pharmacy outlet in {loc}.",
            "Surgeon and anesthesiologist absent during critical trauma patient admission at civil hospital {loc}."
        ],
        "HIGH": [
            "Primary Health Centre in {loc} has no medical doctor present for the past {days} days.",
            "X-ray and Sonography machines at Community Health Centre {loc} out of order for past {days} weeks.",
            "Bio-medical hazardous waste including infected needles and bandages dumped in open field behind hospital {loc}.",
            "Extreme shortage of essential medicines, paracetamol, and ORS packets in primary health clinic {loc}.",
            "Labor room in maternal care clinic {loc} has no running water or sterile equipment.",
            "Dialysis unit machines broken down, chronic kidney patients turned away without treatment in {loc}."
        ],
        "MEDIUM": [
            "Staff at government health sub-centre in {loc} demanding illicit money for issuing vaccination certificates.",
            "Doctor at dispensary arriving 3 hours late regularly, causing senior citizens to wait in sun in {loc}.",
            "OPD registration counter has only one operator for over 400 patients daily in {loc}.",
            "Stretcher and wheelchair wheels broken at entrance of government clinic in {loc}.",
            "Child immunization camp date postponed twice without notifying parents in {loc}."
        ],
        "LOW": [
            "Clean drinking water dispenser not working in hospital OPD waiting lounge in {loc}.",
            "Waiting area ceiling fans in health dispensary {loc} making loud squeaking noise.",
            "Display board showing doctor consultation timings missing outside health clinic {loc}.",
            "Request for seating benches in outdoor waiting shed of health center {loc}."
        ]
    },

    "Education": {
        "CRITICAL": [
            "Ceiling plaster fell on elementary students during classes, three children injured in school at {loc}.",
            "Mid-day meal served to schoolchildren contained dead lizard and worms, 20 pupils hospitalized in {loc}.",
            "School boundary wall collapsed near railway line, exposing small children to high-speed trains in {loc}.",
            "Drinking water tank in village school contaminated, dozens of children sick with food poisoning in {loc}.",
            "Dilapidated school building declared unsafe still hosting classes of 200 primary pupils in {loc}."
        ],
        "HIGH": [
            "Government high school in {loc} has no math or science teacher for the entire academic year.",
            "Middle school in {loc} has no functional toilet for girl students, causing massive dropouts.",
            "No electricity connection in rural school {loc}, children sitting in dark classrooms in 43°C summer.",
            "Classroom roof leaking severely during monsoon rain, destroying desks and textbooks in {loc}.",
            "Contractual teachers going on indefinite strike, leaving school completely shut for {days} days in {loc}."
        ],
        "MEDIUM": [
            "Free textbooks and uniforms under government educational scheme not distributed even 4 months after session start in {loc}.",
            "School playground in {loc} taken over by unauthorized parked commercial vehicles.",
            "Desks and benches broken, students forced to sit on damp concrete floor in school at {loc}.",
            "School computer lab equipment locked in boxes for 2 years without power connection in {loc}.",
            "School bus driver driving recklessly with overcrowded children on {road}."
        ],
        "LOW": [
            "School bell system broken, manual gong being used in school {loc}.",
            "Chalkboard in class 5 at primary school {loc} has cracks and needs repainting.",
            "Request for additional story books and encyclopedia in village school library in {loc}.",
            "Minor paint flaking off classroom exterior walls in school at {loc}."
        ]
    },

    "Sanitation": {
        "CRITICAL": [
            "Underground sewage trunk line choked, raw sewage water backflowing into hundreds of houses in {loc}.",
            "Toxic chemical industrial waste dumped near community playground, emitting noxious fumes in {loc}.",
            "Septic tank leaked directly into municipal drinking water pipeline trench in {loc}.",
            "Unattended human sewage overflowing on main road outside pediatric hospital in {loc}.",
            "Slum settlement in {loc} experiencing severe hepatitis outbreak due to open sewage pools."
        ],
        "HIGH": [
            "Huge garbage dump on street corner in {loc} not cleared for {days} weeks, decomposing and blocking traffic.",
            "Dead cattle carcass lying rotting on roadside of {road} for 3 days, causing unbearable stench.",
            "Community public toilet complex locked and overflowing with feces in ward {num} of {loc}.",
            "Commercial slaughterhouse dumping animal entrails and blood directly into open municipal drain in {loc}.",
            "Mosquito breeding epidemic in {loc} due to stagnant black sewage water in uncleaned open drains."
        ],
        "MEDIUM": [
            "Municipal sanitation sweepers have not visited colony {loc} for past {days} days.",
            "Door-to-door garbage collection vehicle skipping collection in sector {num} of {loc}.",
            "Drainage silt cleared by cleaners left piled on pedestrian pavement and never carted away in {loc}.",
            "Public dustbins in market area {loc} broken and overflowing with plastic bags.",
            "Market vegetable vendors dumping rotten produce directly into open stormwater drains in {loc}."
        ],
        "LOW": [
            "Fallen autumn leaves accumulated in street gutters in sector {num} of {loc}.",
            "Street dustbin missing lid, stray dogs scattering waste in {loc}.",
            "Request for placing separate green and blue waste segregation bins in park at {loc}.",
            "Sticker bills and posters defacing newly painted public sanitation facility in {loc}."
        ]
    },

    "Agriculture": {
        "CRITICAL": [
            "Massive locust attack destroying standing wheat and mustard crops across 500 hectares in {loc}.",
            "Fake spurious pesticide sold by licensed supplier wiped out entire cotton crop in block {loc}.",
            "Canal embankment breached by heavy flow, submerging 200 acres of paddy fields and farmers' huts in {loc}.",
            "Hailstorm and gale winds flattened standing crops across village {loc}, farmers facing total bankruptcy.",
            "Cold storage plant cooling gas leaked, ruining entire stored potato and tomato harvest in {loc}."
        ],
        "HIGH": [
            "Agricultural irrigation feeder canal dry for {days} weeks during critical sowing season in {loc}.",
            "Subsidized fertilizer (Urea and DAP) completely black-marketed and unavailable at government cooperative in {loc}.",
            "Agricultural power transformer burned out, tube wells non-functional during peak irrigation in {loc}.",
            "Herd of wild boars and elephants destroying standing sugarcane crops nightly in farm belt {loc}.",
            "Government grain mandi delaying procurement, farmers' harvested grain soaked in rain in open yard at {loc}."
        ],
        "MEDIUM": [
            "Soil testing laboratory report delayed by 4 months, missed sowing season in block {loc}.",
            "Drip irrigation government subsidy disbursement delayed for over 8 months in {loc}.",
            "Certified seeds provided at block development office had less than 20% germination rate in {loc}.",
            "Canal outlet siphon silted up, tail-end farmers receiving zero irrigation flow in {loc}."
        ],
        "LOW": [
            "Agricultural extension officer not available on scheduled field visit day in {loc}.",
            "Farmer credit card passbook printer out of paper at rural bank branch {loc}.",
            "Request for training workshop on organic compost preparation in village {loc}.",
            "Notice board showing daily mandi crop prices missing at grain market {loc}."
        ]
    },

    "Energy": {
        "CRITICAL": [
            "High voltage 11KV electrical wire snapped and lying alive on wet school pathway in {loc}.",
            "Distribution transformer caught fire and exploded, fire spreading toward adjacent residential huts in {loc}.",
            "Open electrical feeder pillar box with live bare busbars standing unlocked outside children's park in {loc}.",
            "Electric pole broken at base by storm, leaning directly over tin roof of occupied house in {loc}.",
            "Continuous power blackout in civil hospital during emergency surgeries in {loc}."
        ],
        "HIGH": [
            "Unscheduled power cuts lasting 12 to 16 hours daily in {loc} during peak summer heatwave.",
            "Severe low voltage of 110V damaging all domestic refrigerators, water pumps, and fans in {loc}.",
            "Transformer overloaded and tripping every 20 minutes across 400 households in ward {num} of {loc}.",
            "Underground electrical cable burnt, whole commercial market in total darkness for {days} days in {loc}.",
            "Lineman demanding bribe to replace blown transformer fuse in village {loc}."
        ],
        "MEDIUM": [
            "Frequent sudden voltage spikes burning electronic LED appliances in colony {loc}.",
            "Commercial electricity meter running abnormally fast, inflated bill of Rs 50,000 sent to small shop in {loc}.",
            "Streetlight junction box sparking loudly every evening during dusk in {loc}.",
            "Electric wires tangled in tree branches causing sparks in wind near {road} in {loc}."
        ],
        "LOW": [
            "Solar street light battery backup discharged, light turning off by 10 PM in {loc}.",
            "Residential smart meter installation application pending for 3 months in {loc}.",
            "Electricity bill received after the due date, incurring unjustified penalty charge in {loc}.",
            "Request for shifting electricity pole standing slightly inward on private driveway in {loc}."
        ]
    },

    "Transportation": {
        "CRITICAL": [
            "Unmanned railway level crossing with broken boom barrier, blind collision hazard on {road}.",
            "State transport bus operating with completely worn bald tires and failing hydraulic brakes on hill route near {loc}.",
            "Overloaded passenger boat capsized risk due to cracked hull at river crossing in {loc}.",
            "Bridge approach road collapsed, leaving public transport buses stranded on ledge near {loc}."
        ],
        "HIGH": [
            "Commercial private trucks parking illegally on both lanes of narrow highway {road}, causing daily fatal crashes.",
            "Government bus service to rural block {loc} canceled without notice, college students stranded.",
            "Dangerous blind hairpin curve on ghat road {loc} has broken safety crash barriers and zero reflectors.",
            "Extreme overcrowding in city buses with passengers hanging precariously from footboards and window grills in {loc}.",
            "Night bus transport service discontinued abruptly, leaving female hospital workers unsafe in {loc}."
        ],
        "MEDIUM": [
            "Shared auto drivers driving rashly on wrong side of highway and charging 3x metered fare in {loc}.",
            "Bus stop shelter collapsed in heavy storm, commuters forced to stand on highway in rain in {loc}.",
            "State transport buses regularly skipping designated village bus stops in {loc}.",
            "Potholes at bus terminal depot damaging public vehicle axles and stalling departures in {loc}."
        ],
        "LOW": [
            "Bus timetable display screen broken at central bus stand in {loc}.",
            "Auto rickshaw stand encroaching on pedestrian crossing near market {loc}.",
            "Ticket vending machine at bus terminal out of order in {loc}.",
            "Request for additional bus stop shelter along newly developed residential sector in {loc}."
        ]
    },

    "Environment": {
        "CRITICAL": [
            "Chemical chemical plant dumping toxic untreated red effluent directly into Subarnarekha river stream near {loc}.",
            "Illegal sand mining mafia using heavy dredging excavators, destroying river ecosystem and groundwater table at {loc}.",
            "Hazardous industrial gas leak from factory causing nausea, fainting, and breathing distress in surrounding village {loc}.",
            "Toxic fly ash slurry dam breach flooded village agricultural fields with hazardous sludge near {loc}.",
            "Massive forest fire spreading uncontrolled toward tribal settlements and wildlife habitat in {loc}."
        ],
        "HIGH": [
            "Dense poisonous smoke from open garbage burning at municipal dumping ground suffocating {loc}.",
            "Stone crushing factories operating without water sprinklers, entire residential area enveloped in toxic silica dust in {loc}.",
            "Illegal commercial timber logging and cutting of ancient Sal trees in protected forest zone of {loc}.",
            "Brick kilns operating illegal coal combustion chimneys, air quality index crossing severe 450 in {loc}.",
            "Pesticide dumping caused sudden death of thousands of fish in community lake at {loc}."
        ],
        "MEDIUM": [
            "Excessive noise pollution from industrial diesel generators running all night in declared silent zone of {loc}.",
            "Construction and demolition debris dumped openly on dry riverbed near {road}.",
            "Plastic waste and non-biodegradable thermocol clogging forest stream in tourist spot {loc}.",
            "Deforestation and unmonitored hill cutting leading to soil erosion onto roads during monsoons in {loc}."
        ],
        "LOW": [
            "Overgrown wild weeds and Congress grass causing seasonal pollen allergies in colony park {loc}.",
            "Old transport truck emitting black smoke exhaust while idling at traffic stop in {loc}.",
            "Public park green lawn dried up due to lack of municipal gardening staff in {loc}.",
            "Request for tree plantation drive along newly expanded 4-lane avenue in {loc}."
        ]
    },

    "Public Safety": {
        "CRITICAL": [
            "Armed gang carrying out chain snatching and robberies on dark bypass stretch of {road} after 8 PM.",
            "Open deep stone quarry pit filled with 40 feet of stagnant water without fencing, child drowned yesterday in {loc}.",
            "Emergency Police dial 112 / 100 helpline calls ringing unanswered during violent burglary distress in {loc}.",
            "Dilapidated four-story abandoned factory on verge of immediate structural collapse near crowded marketplace in {loc}.",
            "Illegal crude firecracker and explosives manufacturing operating in densely packed residential colony in {loc}."
        ],
        "HIGH": [
            "Gang of anti-social youth eve-teasing and harassing female students daily outside coaching hub in {loc}.",
            "Pack of aggressive rabid stray dogs attacked and mauled multiple senior citizens and children in {loc}.",
            "Pedestrian subway has zero lighting, non-functional CCTV, and zero police patrols, making it dangerous after dark in {loc}.",
            "Commercial shopping complex fire exits permanently chained shut and fire extinguisher cylinders expired in {loc}.",
            "Frequent drunken brawls and stone pelting outside illegal country liquor shop near school in {loc}."
        ],
        "MEDIUM": [
            "Deep construction trench left completely unbarricaded with zero warning hazard lamps on road in {loc}.",
            "Organized cyber fraud gang duping illiterate rural elders of their pension funds under fake scheme in {loc}.",
            "Stray cattle wandering on state highway {road}, causing frequent motorcycle skids and collisions.",
            "CCTV cameras installed at main market intersection non-functional for past 6 months in {loc}."
        ],
        "LOW": [
            "Street vegetable market causing minor pedestrian bottleneck on evening sidewalks in {loc}.",
            "Unauthorized commercial advertising banners blocking driver visibility at road turning in {loc}.",
            "Loud music played after 10 PM during local marriage celebrations in sector {num} of {loc}.",
            "Abandoned scrap car left parked on colony street corner for 1 year in {loc}."
        ]
    }
}

LOCATIONS = [
    "Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Deoghar",
    "Hazaribagh", "Giridih", "Ramgarh", "Dumka", "Chaibasa",
    "Palamu", "Garhwa", "Chatra", "Koderma", "Godda",
    "Sahebganj", "Pakur", "Jamtara", "Simdega", "Khunti",
    "Gumla", "Lohardaga", "Saraikela", "West Singhbhum"
]

ROADS = [
    "Main Road", "Station Road", "Ring Road", "Bypass Highway",
    "College Road", "Market Square", "GT Road", "Airport Road",
    "Circular Road", "Industrial Area Road", "Hospital Road"
]

def generate_samples():
    dataset = []
    
    # Generate 6 diverse permutations per template
    for category, sev_dict in CATEGORY_DATA.items():
        for severity, templates in sev_dict.items():
            for template in templates:
                for _ in range(6):
                    loc = random.choice(LOCATIONS)
                    road = random.choice(ROADS)
                    days = random.choice([2, 3, 4, 5, 7, 10, 14, 21, 30])
                    num = random.randint(1, 25)
                    count = random.choice([30, 50, 100, 200, 350, 500, 800, 1200])
                    
                    text = template.format(
                        loc=loc,
                        road=road,
                        days=days,
                        num=num,
                        count=count
                    )
                    dataset.append((text, category, severity))

    # Add further realistic randomized samples to reach target 1,550+ records (1000+ more)
    while len(dataset) < 1550:
        cat = random.choice(list(CATEGORY_DATA.keys()))
        sev = random.choice(list(CATEGORY_DATA[cat].keys()))
        template = random.choice(CATEGORY_DATA[cat][sev])
        loc = random.choice(LOCATIONS)
        road = random.choice(ROADS)
        days = random.choice([1, 2, 3, 5, 8, 12, 15, 20, 30, 45])
        num = random.randint(1, 30)
        count = random.choice([40, 80, 150, 250, 400, 700, 1500])
        
        text = template.format(loc=loc, road=road, days=days, num=num, count=count)
        dataset.append((text, cat, sev))
        
    random.shuffle(dataset)
    df = pd.DataFrame(dataset, columns=["text", "category", "severity"])
    out_path = os.path.join(os.path.dirname(__file__), "data", "civic_complaints.csv")
    df.to_csv(out_path, index=False, encoding="utf-8")
    
    print(f"Successfully generated {len(df)} samples into {out_path}!")
    print("\n--- Category Breakdown ---")
    print(df["category"].value_counts())
    print("\n--- Severity Breakdown ---")
    print(df["severity"].value_counts())

if __name__ == "__main__":
    generate_samples()
