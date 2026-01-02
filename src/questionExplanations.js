// Specific explanations for each question based on generator technician knowledge
export const questionExplanations = {
  1: "Alternating Current (AC) is bi-directional, meaning the current periodically reverses direction as the voltage alternates between positive and negative. This is fundamentally different from Direct Current (DC), which flows in only one direction. In generators, AC is produced when the rotor's magnetic field rotates past the stator windings.",
  
  2: "Total power in a series circuit is determined by multiplying the source voltage by the current (P = V × I). This is Ohm's Law applied to power calculation. In generator systems, understanding power calculations is essential for proper load management and preventing overload conditions.",
  
  3: "Polarity has particular significance in DC (Direct Current) circuits because DC flows in one direction from positive to negative. Reversing polarity in DC circuits can damage equipment, especially electronics and batteries. In AC circuits, polarity constantly alternates, so it's less critical for most applications.",
  
  4: "Resistance in an electrical conductor varies with length (longer = more resistance), temperature (higher temp = more resistance in most conductors), and size/cross-sectional area (larger = less resistance). These factors are critical when sizing cables for generator installations to minimize voltage drop and heat buildup.",
  
  5: "Volts (V) is the unit of measure for electrical pressure or electromotive force (EMF). Voltage is the 'push' that drives current through a circuit. Generators produce voltage through electromagnetic induction, and maintaining proper voltage output is critical for equipment operation.",
  
  6: "A voltmeter measures the difference of potential (voltage) between two points in a circuit. It's connected in parallel across the component being measured. Technicians use voltmeters constantly to verify generator output voltage and troubleshoot electrical issues.",
  
  7: "An ammeter measures current flow in amperes (amps). It must be connected in series with the circuit so all the current flows through it. Clamp-on ammeters are commonly used by generator technicians to measure load current without breaking the circuit.",
  
  8: "A phase rotation meter is specifically designed to measure phase sequencing in three-phase power systems. Correct phase rotation (ABC or 123 sequence) is critical for three-phase motors and equipment to rotate in the correct direction. Incorrect phase rotation can damage equipment.",
  
  9: "When encountering lockout/tagout (LOTO), you must determine the source of the lock before proceeding. LOTO procedures protect workers from unexpected equipment energization. Never remove another person's lock - it could be protecting someone working on the equipment.",
  
  10: "The proper sequence for testing if a circuit is de-energized is: 1) Verify your meter works on a known live source, 2) Test the circuit you're working on, 3) Verify the meter still works on a known live source. This 'test-before-touch' procedure ensures your meter is functioning and the circuit is truly dead.",
  
  11: "The correct sequence is: Connect positive cable first, tighten it, then connect negative cable, then tighten negative. This sequence minimizes the risk of creating a short circuit with your wrench. Always connect positive first and disconnect negative first.",
  
  12: "When checking voltage, always assume the circuit is LIVE until proven otherwise with proper testing. This safety mindset prevents electrical shock accidents. Never trust labels, switches, or what someone tells you - always verify with your meter.",
  
  13: "Before re-closing a tripped breaker, always identify the cause of the trip and inspect the breaker for damage. A tripped breaker indicates an overload, short circuit, or ground fault. Simply resetting it without investigation can cause equipment damage, fire, or injury.",
  
  14: "A two-stroke engine completes the power stroke in ONE crankshaft revolution. This is because two-stroke engines complete intake, compression, power, and exhaust in just two strokes (one revolution), compared to four strokes (two revolutions) in a four-stroke engine.",
  
  15: "Diesel is NOT a fuel for spark-ignited engines. Diesel engines use compression ignition, not spark plugs. Natural gas, propane, and gasoline are all spark-ignited fuels. Understanding fuel types is critical for proper generator maintenance and troubleshooting.",
  
  16: "The proper four-stroke cycle sequence is: Intake, Compression, Power, Exhaust. Remember 'I Can't Play Enough' or 'I Compression Power Exhaust'. This cycle repeats continuously as the engine runs, with each stroke occurring during one half-revolution of the crankshaft.",
  
  17: "The three basic components of an electric starting system are: batteries (provide electrical energy), starter motor (converts electrical to mechanical energy), and pilot relay/solenoid (controls high current to the starter). All three must function properly for reliable generator starting.",
  
  18: "Two 12V batteries connected in parallel provide 12V but with doubled capacity (amp-hours). Parallel connection means positive to positive and negative to negative. To get 24V, you would connect them in series (positive of one to negative of the other).",
  
  19: "Three major components of a gaseous fuel system are: carburetor (mixes air and fuel), spark plug (ignites the mixture), and secondary regulator (reduces gas pressure to usable levels). These systems are common in natural gas and propane generators.",
  
  20: "A manometer measures gas pressure differential. It's a U-shaped tube containing liquid that shows pressure differences between two points. Technicians use manometers to verify proper gas pressure in natural gas and propane systems, typically measuring in inches of water column.",
  
  21: "Propane has the greatest BTU content among common gaseous fuels at approximately 2,500 BTU per cubic foot, compared to natural gas at about 1,000 BTU per cubic foot. Higher BTU content means more energy per unit volume, affecting fuel consumption rates and generator sizing.",
  
  22: "A turbocharger makes a greater mass of air available for combustion by compressing intake air. More air allows more fuel to be burned, increasing power output without increasing engine size. Turbos use exhaust gas energy to spin a compressor that forces more air into the engine.",
  
  23: "An intercooler (aftercooler) reduces intake charged air temperature. When air is compressed by a turbocharger, it heats up. Cooling this compressed air makes it denser, allowing even more air molecules into the combustion chamber, improving efficiency and power while reducing the risk of detonation.",
  
  24: "Oil samples should be taken when the equipment is running or hot. This ensures the oil is well-mixed and suspended contaminants are evenly distributed, giving an accurate representation of oil condition. Cold oil samples can give misleading results because contaminants settle out.",
  
  25: "A magneto is found in self-powered ignition systems. It generates its own electrical power for ignition without relying on the battery or charging system. Magnetos use permanent magnets and rotating coils to produce high voltage for spark plugs, making them reliable for backup generators.",
  
  26: "Improper timing can cause backfire, overheating/engine failure, and detonation/pre-ignition. However, ignition coil failure is typically NOT caused by improper timing - coils fail due to heat, vibration, or electrical issues. Timing affects when combustion occurs, not coil reliability.",
  
  27: "The ignition system is left on during shutdown to burn off remaining fuel in the combustion chamber and fuel system. This prevents 'wet stacking' (unburned fuel accumulation) and carbon buildup, which can cause hard starting and poor performance on the next start.",
  
  28: "The voltage regulator controls the electromagnetic field in the rotor. By varying the DC current to the rotor windings, the regulator adjusts the strength of the magnetic field, which in turn controls the generator's output voltage. This keeps voltage stable as load changes.",
  
  29: "The rotating component of a generator that produces the magnetic field is called the rotor. In most generators, the rotor spins inside the stationary stator windings. The rotor contains electromagnets (field windings) that are energized by DC current from the voltage regulator.",
  
  30: "The stationary windings in a generator where voltage is induced are called the stator. As the rotor's magnetic field rotates past the stator windings, it induces an AC voltage in them through electromagnetic induction. The stator is the generator's main power-producing component.",
  
  31: "Hertz (Hz) is the unit of measurement for frequency. One Hertz equals one cycle per second. In North America, AC power operates at 60 Hz, meaning the current completes 60 full cycles (positive and negative alternations) every second.",
  
  32: "Single-phase power has two wires (one hot and one neutral, plus ground). It's used for residential and light commercial applications. Most household appliances run on single-phase 120V or 240V power. Single-phase generators are simpler and less expensive than three-phase units.",
  
  33: "Three-phase power has three hot wires, each carrying AC voltage that is 120 degrees out of phase with the others. Three-phase power is more efficient for large motors and industrial equipment, providing smoother power delivery and better efficiency than single-phase.",
  
  34: "Voltage regulation is the generator's ability to maintain constant output voltage as load changes. Good voltage regulation (typically ±5%) is essential for protecting sensitive electronic equipment. Poor regulation causes voltage to sag under load or rise when load is removed.",
  
  35: "Frequency in a generator is determined by the engine speed (RPM) and the number of magnetic poles. For 60 Hz output, a 2-pole generator must spin at 3,600 RPM, while a 4-pole generator runs at 1,800 RPM. The formula is: Frequency = (RPM × Poles) ÷ 120.",
  
  36: "A generator's kilowatt (kW) rating indicates its real power output capacity - the actual work it can perform. This is different from kVA (kilovolt-amperes), which is apparent power. The relationship is: kW = kVA × Power Factor. Always size generators based on kW requirements.",
  
  37: "Power factor is the ratio of real power (kW) to apparent power (kVA), expressed as a decimal or percentage. A power factor of 0.8 (80%) means 80% of the apparent power is doing useful work, while 20% is reactive power. Inductive loads like motors have lower power factors.",
  
  38: "Reactive power (measured in kVAR) is the power consumed by inductive and capacitive loads to create magnetic and electric fields. It doesn't perform useful work but is necessary for equipment operation. Generators must be sized to handle both real and reactive power.",
  
  39: "Voltage drop is the reduction in voltage that occurs when current flows through resistance in wires and connections. Excessive voltage drop (typically more than 3%) can cause equipment malfunction. Use larger wire sizes and shorter runs to minimize voltage drop in generator installations.",
  
  40: "A ground fault occurs when current flows to ground through an unintended path, such as through a person or damaged insulation. Ground Fault Circuit Interrupters (GFCIs) detect this imbalance and quickly disconnect power to prevent electrocution. GFCIs are required in wet locations.",
  
  41: "Short circuit current is the maximum current that flows when a circuit's hot and neutral (or hot and ground) are connected with near-zero resistance. Short circuits can produce thousands of amperes, generating extreme heat and magnetic forces. Proper overcurrent protection is essential.",
  
  42: "Load bank testing applies artificial electrical loads to verify a generator can handle its rated capacity and maintain proper voltage and frequency under load. Regular load bank testing (typically annually) identifies problems before they cause failures during actual power outages.",
  
  43: "An automatic transfer switch (ATS) automatically switches the electrical load from utility power to generator power when it detects a utility failure, and back to utility when power is restored. ATSs are essential for unattended backup power systems.",
  
  44: "Transfer switch transition time is how long it takes to switch from one power source to another. Open transition (break-before-make) has a brief power interruption. Closed transition (make-before-break) has no interruption but requires synchronization to prevent backfeed.",
  
  45: "Generator paralleling allows multiple generators to operate together, sharing the load. Paralleling requires matching voltage, frequency, phase angle, and phase rotation. Benefits include redundancy, increased capacity, and the ability to run only the generators needed for current load.",
  
  46: "Synchronization is the process of matching voltage, frequency, and phase angle of two AC sources before connecting them in parallel. Improper synchronization can cause severe damage from high circulating currents. Synchronizing equipment automatically matches these parameters.",
  
  47: "Load sharing ensures that paralleled generators share the electrical load proportionally according to their ratings. The governor system on each generator adjusts engine speed to maintain proper load sharing. Unequal load sharing can overload one generator while underloading others.",
  
  48: "Reverse power (or reverse current) occurs when a paralleled generator receives power from the bus instead of supplying it. This happens when one generator's engine loses power or the governor fails. Reverse power relays detect this condition and trip the generator offline.",
  
  49: "Isochronous governor mode maintains constant engine speed regardless of load. This mode is used for single generators or the master generator in a parallel system. Isochronous governors provide the tightest frequency control, typically ±0.25 Hz or better.",
  
  50: "Droop governor mode allows engine speed to decrease slightly as load increases. Droop is necessary for stable load sharing between paralleled generators. Typical droop is 3-5%, meaning speed drops 3-5% from no-load to full-load. Only one generator in a parallel system should run isochronous.",
  
  51: "Engine coolant serves multiple purposes: removes combustion heat from the engine, prevents freezing in cold weather (with antifreeze), prevents corrosion, and lubricates the water pump. Proper coolant mixture (typically 50/50 water and antifreeze) is essential for engine protection.",
  
  52: "Coolant temperature should typically be maintained between 180-200°F (82-93°C) during operation. Too low indicates a stuck-open thermostat or overcooling, reducing efficiency and causing incomplete combustion. Too high indicates overheating, which can cause engine damage.",
  
  53: "A thermostat controls coolant flow to maintain proper engine operating temperature. When cold, it stays closed, allowing the engine to warm up quickly. When hot, it opens to allow coolant to flow through the radiator for cooling. A stuck thermostat causes overheating or overcooling.",
  
  54: "The water pump circulates coolant through the engine and cooling system. It's typically belt-driven from the crankshaft. Water pump failure causes overheating and can lead to catastrophic engine damage. Signs of failure include coolant leaks, bearing noise, and overheating.",
  
  55: "The radiator dissipates heat from the coolant to the atmosphere. Hot coolant flows through radiator tubes while air flows across fins, transferring heat. Radiator capacity must match engine heat rejection. Blocked radiators, low coolant, or fan failure cause overheating.",
  
  56: "Radiator cap pressure rating (typically 13-16 PSI) raises the coolant boiling point, allowing higher operating temperatures without boiling. A 15 PSI cap raises the boiling point from 212°F to about 257°F. Never remove a hot radiator cap - pressure release can cause severe burns.",
  
  57: "Engine oil lubricates moving parts, reduces friction and wear, cools components, cleans by suspending contaminants, seals piston rings, and protects against corrosion. Using the correct oil type and viscosity, and changing it regularly, is critical for engine longevity.",
  
  58: "Oil pressure should typically be 30-60 PSI during operation, depending on engine design. Low oil pressure indicates wear, dilution, or pump failure and can cause catastrophic engine damage. High pressure may indicate a blocked passage or relief valve failure.",
  
  59: "Oil viscosity is its resistance to flow, indicated by SAE numbers (e.g., 15W-40). The 'W' stands for winter. Multi-grade oils (like 15W-40) flow well when cold (15W) but maintain protection when hot (40). Use the manufacturer-specified viscosity for your climate and application.",
  
  60: "Oil analysis detects engine wear and contamination by measuring metals, fuel dilution, coolant, soot, and other contaminants in used oil. Trending oil analysis results over time identifies developing problems before they cause failures. It's an essential predictive maintenance tool.",
  
  61: "Air filters prevent dirt and debris from entering the engine, which would cause rapid wear of cylinders, pistons, and rings. Restricted air filters reduce power and efficiency. Check and service air filters regularly - more frequently in dusty environments.",
  
  62: "Fuel filters remove contaminants from fuel before it reaches the injection system. Diesel injection systems operate at extremely high pressures (up to 30,000+ PSI) and have very tight tolerances. Even tiny particles can damage injectors. Replace fuel filters per manufacturer recommendations.",
  63: "Water in diesel fuel causes corrosion, microbial growth, and injector damage. Diesel fuel separators remove water through gravity separation and coalescing. Drain water from fuel/water separators regularly. Water contamination is a leading cause of diesel generator problems.",
  
  64: "Diesel fuel gelling occurs when paraffin wax in diesel solidifies in cold temperatures (typically below 10-20°F). Gelled fuel won't flow through filters, preventing engine operation. Use winterized diesel fuel or fuel additives in cold climates to prevent gelling.",
  
  65: "Fuel system priming removes air from the fuel system after filter changes, running out of fuel, or repairs. Air in diesel fuel systems prevents starting and causes rough running. Most systems have a manual primer pump or electric priming pump to purge air.",
  
  66: "Diesel fuel injectors atomize fuel into a fine spray for efficient combustion. Modern common-rail injectors operate at 20,000-30,000 PSI. Dirty or worn injectors cause hard starting, rough running, black smoke, and poor fuel economy. Injectors require clean fuel to survive.",
  
  67: "Black smoke from a diesel engine indicates incomplete combustion due to too much fuel or insufficient air. Causes include overloading, restricted air intake, faulty injectors, or improper timing. Black smoke wastes fuel and causes carbon buildup.",
  
  68: "White smoke from a diesel engine indicates unburned fuel, typically during cold starts or from low compression, water in fuel, or faulty injectors. Persistent white smoke indicates a problem requiring attention. Some white smoke is normal during cold starts.",
  
  69: "Blue smoke indicates burning oil, caused by worn piston rings, valve guides, or turbocharger seals. Oil consumption increases and power decreases. Blue smoke indicates significant engine wear requiring major repairs.",
  
  70: "Excessive crankcase pressure (blowby) indicates worn piston rings or cylinder walls allowing combustion gases to escape past the pistons into the crankcase. This increases oil consumption, reduces power, and can blow out seals. Blowby is measured to assess engine condition.",
  
  71: "Battery specific gravity measures the concentration of sulfuric acid in the electrolyte, indicating state of charge. A fully charged battery reads 1.265, while a discharged battery reads 1.120 or less. Hydrometers measure specific gravity. Low readings indicate discharge or sulfation.",
  
  72: "Battery voltage under load is a better indicator of condition than open-circuit voltage. A load test applies a specified load (typically half the CCA rating) for 15 seconds while measuring voltage. Voltage should stay above 9.6V for a 12V battery. Lower voltage indicates failure.",
  
  73: "Battery sulfation occurs when lead sulfate crystals form on the plates during discharge. If batteries sit discharged, these crystals harden and become permanent, reducing capacity. Regular charging and avoiding deep discharge prevent sulfation. Sulfated batteries have reduced capacity and won't fully charge.",
  
  74: "Battery charging voltage for 12V batteries should be 13.8-14.4V for float charging (maintaining full charge) and 14.4-14.8V for bulk charging (recharging discharged batteries). Overcharging causes water loss and plate damage. Undercharging causes sulfation.",
  
  75: "Battery equalization is a controlled overcharge (typically 15-16V for 12V batteries) that breaks down sulfation and balances cell voltages in flooded lead-acid batteries. Equalize quarterly or when cell voltages vary by more than 0.05V. Never equalize sealed batteries.",
  
  76: "Battery temperature affects capacity and charging. Cold batteries have reduced capacity (50% at 0°F) and require higher charging voltage. Hot batteries have higher capacity but shorter life. Compensate charging voltage for temperature: reduce 0.005V per cell per degree F above 77°F.",
  
  77: "Generator exercising (running unloaded periodically) prevents fuel system problems, keeps batteries charged, circulates oil, and verifies operation. However, light-load operation causes wet stacking in diesel engines. Exercise at 50-80% load if possible, or use load banks periodically.",
  
  78: "Wet stacking is unburned fuel accumulation in diesel engine exhaust systems from prolonged light-load operation (below 30% load). It causes carbon buildup, oil dilution, and poor performance. Prevent wet stacking by exercising at higher loads or performing periodic load bank testing.",
  
  79: "Generator nameplate data includes critical information: voltage, frequency, kW/kVA ratings, power factor, phase configuration, connection diagrams, and serial number. Always verify nameplate data before connecting loads or performing maintenance. Mismatched voltage or phase can damage equipment.",
  
  80: "Generator connection diagrams show how to configure voltage and phase outputs. Many generators can be reconnected for different voltages (e.g., 120/240V or 120/208V or 277/480V). Always follow the manufacturer's connection diagram exactly - incorrect connections can damage the generator or loads.",
  
  81: "Preventive maintenance (PM) is scheduled maintenance performed at regular intervals to prevent failures. PM includes oil changes, filter replacements, inspections, and testing. Following the manufacturer's PM schedule maximizes reliability and lifespan while minimizing unexpected failures.",
  
  82: "Predictive maintenance uses condition monitoring (oil analysis, vibration analysis, thermal imaging, etc.) to detect developing problems before they cause failures. This allows repairs to be scheduled during convenient times rather than dealing with emergency breakdowns.",
  
  83: "Mean Time Between Failures (MTBF) is the average time a generator operates between failures. Higher MTBF indicates better reliability. MTBF is calculated by dividing total operating time by the number of failures. Track MTBF to identify reliability trends.",
  
  84: "Generator runtime meters track total operating hours, essential for scheduling maintenance. Like a vehicle odometer, runtime determines when oil changes, filter replacements, and other services are due. Always record runtime during service visits.",
  
  85: "Battery chargers maintain generator starting batteries at full charge. Float charging at 13.5-13.8V maintains charge without overcharging. Charger failure is a leading cause of generator start failures. Test charger output voltage regularly.",
  
  86: "Block heaters keep engine coolant warm (typically 90-120°F) in cold climates, ensuring reliable starting and reducing wear during cold starts. Block heaters should run continuously in freezing weather. Verify operation by feeling coolant hoses for warmth.",
  
  87: "Fuel level monitoring prevents running out of fuel during extended outages. Fuel consumption varies with load - a generator at 50% load uses roughly half the fuel of 100% load. Monitor fuel level and arrange delivery before running low.",
  
  88: "Remote monitoring systems provide real-time generator status, alarms, and data logging via internet, cellular, or phone connections. Remote monitoring enables proactive maintenance, quick response to problems, and documentation of generator performance.",
  
  89: "Generator alarms indicate problems requiring attention: low oil pressure, high coolant temperature, overcrank (failure to start), overspeed, low fuel, battery problems, and more. Never ignore alarms - they prevent catastrophic damage. Always investigate and resolve alarm causes.",
  
  90: "Emergency stop (E-stop) buttons provide immediate generator shutdown in emergencies. E-stops are typically red mushroom-head buttons located near the generator. After E-stop activation, the generator won't restart until the E-stop is reset and the cause is investigated.",
  
  91: "Voltage and frequency tolerances specify acceptable variations from nominal values. Most equipment tolerates ±10% voltage and ±5% frequency. Sensitive electronics may require tighter tolerances (±5% voltage, ±0.5 Hz frequency). Generators must maintain these tolerances under all load conditions.",
  
  92: "Harmonic distortion is caused by non-linear loads (computers, variable frequency drives, LED lighting) that draw current in non-sinusoidal waveforms. Harmonics cause overheating, neutral conductor overload, and equipment malfunction. Total Harmonic Distortion (THD) should be below 5% for most equipment.",
  
  93: "Generator grounding provides a path for fault current and lightning protection, and establishes a reference point for the electrical system. Proper grounding is essential for safety and equipment protection. Follow NEC Article 250 requirements for generator grounding.",
  
  94: "Separately derived systems (most generator installations) require a neutral-ground bond at the generator and nowhere else. This prevents parallel ground paths that can cause circulating currents and nuisance tripping. The transfer switch must switch the neutral to maintain proper bonding.",
  
  95: "Ground fault protection detects current leakage to ground and trips the generator offline to prevent electrocution and fire. Ground fault protection is required for generators over 150V to ground. Test ground fault protection regularly to ensure it functions properly.",
  
  96: "Overcurrent protection (circuit breakers or fuses) protects wiring and equipment from damage due to overload or short circuits. Size overcurrent devices at 125% of continuous load. Coordinate protection devices so the one closest to the fault trips first.",
  
  97: "Arc flash hazard is the explosive release of energy during an electrical fault. Arc flash can cause severe burns, blindness, and death. Always wear appropriate PPE (personal protective equipment) when working on energized equipment. De-energize equipment whenever possible.",
  
  98: "Lockout/Tagout (LOTO) procedures prevent unexpected equipment startup during maintenance. Lock the disconnect switch open, tag it with your name and date, and keep the key. LOTO is required by OSHA and prevents numerous deaths and injuries annually.",
  
  99: "Personal Protective Equipment (PPE) for electrical work includes safety glasses, insulated gloves, arc-rated clothing, and face shields. PPE requirements depend on voltage, available fault current, and work being performed. Never skip PPE - it saves lives.",
  
  100: "The National Electrical Code (NEC) Article 700 covers emergency systems, Article 701 covers legally required standby systems, and Article 702 covers optional standby systems. Understanding which article applies determines installation requirements. Always follow applicable NEC articles and local codes."
};

// Export function to get explanation by question number
export const getExplanationByNumber = (questionNumber) => {
  return questionExplanations[questionNumber] || "This answer is correct based on industry standards and best practices for generator operation and maintenance. Understanding this concept is essential for safe and effective generator service work.";
};
