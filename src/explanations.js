// AI-generated explanations for correct answers
export const generateExplanation = (question, correctAnswer) => {
  // This function generates contextual explanations based on the question content
  const q = question.toLowerCase();
  const answer = correctAnswer.toLowerCase();
  
  // Generator-specific explanations based on question keywords
  if (q.includes('alternating') && q.includes('direct current')) {
    return 'Alternating current (AC) periodically reverses direction, moving back and forth, which is why it\'s called "bi-directional." Direct current (DC) flows in only one direction.';
  }
  
  if (q.includes('voltage') && q.includes('120')) {
    return 'Standard household voltage in North America is 120 volts AC. This is the voltage supplied to most residential outlets and is regulated by electrical codes.';
  }
  
  if (q.includes('frequency') && (q.includes('60') || q.includes('hertz'))) {
    return 'In North America, the standard electrical frequency is 60 Hz (hertz), meaning the current alternates direction 60 times per second. This frequency is optimized for power transmission and motor operation.';
  }
  
  if (q.includes('generator') && (q.includes('mechanical') || q.includes('electrical'))) {
    return 'A generator converts mechanical energy (from an engine or turbine) into electrical energy through electromagnetic induction. This is the fundamental principle behind all power generation.';
  }
  
  if (q.includes('ohm') && q.includes('law')) {
    return 'Ohm\'s Law (V = I × R) describes the relationship between voltage, current, and resistance in an electrical circuit. This fundamental law is essential for understanding and troubleshooting electrical systems.';
  }
  
  if (q.includes('grounding') || q.includes('ground')) {
    return 'Proper grounding provides a safe path for electrical current to flow to the earth in case of a fault, protecting equipment and personnel from electrical shock hazards.';
  }
  
  if (q.includes('circuit breaker') || q.includes('fuse')) {
    return 'Circuit protection devices like breakers and fuses prevent electrical overload by interrupting current flow when it exceeds safe levels, protecting wiring and equipment from damage or fire.';
  }
  
  if (q.includes('maintenance') || q.includes('service')) {
    return 'Regular maintenance is critical for generator reliability and longevity. Following manufacturer-recommended service intervals prevents breakdowns and ensures optimal performance.';
  }
  
  if (q.includes('fuel') || q.includes('diesel') || q.includes('gas')) {
    return 'Proper fuel management, including quality, storage, and filtration, is essential for generator operation. Contaminated or degraded fuel is a leading cause of generator failures.';
  }
  
  if (q.includes('cooling') || q.includes('temperature')) {
    return 'Generator cooling systems prevent overheating by dissipating heat generated during operation. Maintaining proper coolant levels and system function is critical for preventing engine damage.';
  }
  
  if (q.includes('load') && (q.includes('bank') || q.includes('test'))) {
    return 'Load bank testing verifies a generator\'s ability to handle its rated capacity by applying artificial electrical loads. This testing identifies potential issues before they cause failures during actual power outages.';
  }
  
  if (q.includes('transfer switch') || q.includes('automatic transfer')) {
    return 'An automatic transfer switch (ATS) detects power loss and automatically switches the electrical load from utility power to generator power, ensuring continuous operation of critical systems.';
  }
  
  if (q.includes('parallel') && q.includes('generator')) {
    return 'Paralleling generators allows multiple units to work together to meet larger power demands or provide redundancy. Proper synchronization and load sharing are essential for safe parallel operation.';
  }
  
  if (q.includes('battery') || q.includes('starting')) {
    return 'Generator batteries provide the electrical power needed to start the engine. Regular battery maintenance, including testing and charging, ensures reliable generator starting when needed.';
  }
  
  if (q.includes('safety') || q.includes('hazard')) {
    return 'Safety procedures and protocols protect technicians and equipment from electrical, mechanical, and environmental hazards. Following proper safety practices is mandatory in generator service work.';
  }
  
  // Generic explanation based on answer patterns
  if (answer.includes('regular') || answer.includes('schedule') || answer.includes('periodic')) {
    return `The correct answer emphasizes the importance of regular, scheduled procedures. In generator maintenance, consistency and adherence to manufacturer guidelines ensure reliability and prevent unexpected failures.`;
  }
  
  if (answer.includes('immediately') || answer.includes('stop') || answer.includes('shut')) {
    return `This answer indicates an urgent safety or operational concern. Immediate action is required to prevent equipment damage, safety hazards, or system failures.`;
  }
  
  if (answer.includes('manufacturer') || answer.includes('specification') || answer.includes('manual')) {
    return `Following manufacturer specifications and guidelines is essential for proper generator operation and maintenance. These specifications are based on engineering design and testing to ensure optimal performance.`;
  }
  
  // Default explanation
  return `This is the correct answer based on industry standards and best practices for generator operation and maintenance. Understanding this concept is essential for safe and effective generator service work.`;
};
