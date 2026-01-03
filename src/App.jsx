import { useState, useEffect, useRef } from 'react';
import { jsPDF } from 'jspdf';
import { getExplanationByNumber } from './questionExplanations';

const SUPABASE_URL = 'https://nnaakuspoqjdyzheklyb.supabase.co';
const SUPABASE_KEY = 'sb_publishable_JInuN0N2KjxYViZTrt_M-Q_dSAZFdCf';

export default function App() {
  const [stage, setStage] = useState('landing'); // landing, test, results
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phone: '',
    branch: '',
    skillLevel: ''
  });
  const [questions, setQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(90 * 60); // 90 minutes in seconds
  const [isPaused, setIsPaused] = useState(false);
  const [testStartTime, setTestStartTime] = useState(null);
  const [pauseCount, setPauseCount] = useState(0);
  const [timeTaken, setTimeTaken] = useState(0);
  const [showReport, setShowReport] = useState(false);
  const timerRef = useRef(null);

  // Load questions from Supabase
  useEffect(() => {
    async function loadQuestions() {
      try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/questions?order=question_number.asc`, {
          headers: {
            'apikey': SUPABASE_KEY,
            'Content-Type': 'application/json'
          }
        });
        const data = await response.json();
        
        // Transform Supabase format to app format
        const transformedQuestions = data.map(q => ({
          number: q.question_number,
          category: q.category,
          question: q.question_text,
          options: [
            `A-${q.answer_a}`,
            `B-${q.answer_b}`,
            `C-${q.answer_c}`,
            `D-${q.answer_d}`
          ],
          correct_answer_letter: q.correct_answer_letter
        }));
        
        setQuestions(transformedQuestions);
        setLoadingQuestions(false);
      } catch (error) {
        console.error('Error loading questions:', error);
        alert('Error loading questions from database');
        setLoadingQuestions(false);
      }
    }
    loadQuestions();
  }, []);

  // Timer effect
  useEffect(() => {
    if (stage === 'test' && !isPaused && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSubmitTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [stage, isPaused, timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartTest = () => {
    if (!userData.name || !userData.email || !userData.phone || !userData.branch || !userData.skillLevel) {
      alert('Please fill in all fields');
      return;
    }
    setTestStartTime(new Date());
    setStage('test');
  };

  const handleAnswerSelect = (answer) => {
    setAnswers({ ...answers, [currentQuestion]: answer });
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const calculateResults = () => {
    let correct = 0;
    questions.forEach((q, index) => {
      if (answers[index] === q.correct_answer_letter) {
        correct++;
      }
    });
    const percentage = (correct / questions.length) * 100;
    const passed = percentage >= 70;
    return { correct, total: questions.length, percentage: percentage.toFixed(1), passed };
  };

  const generateCertificate = (results) => {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    // White background
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, 297, 210, 'F');

    // Double border - outer
    doc.setDrawColor(30, 58, 95); // Dark navy
    doc.setLineWidth(0.8);
    doc.rect(10, 10, 277, 190);
    
    // Double border - inner
    doc.setLineWidth(0.3);
    doc.rect(15, 15, 267, 180);

    // Logo (using base64 or image URL)
    // Using new blue logo
    try {
      doc.addImage('/generator-source-logo-blue.jpg', 'JPEG', 125, 25, 47, 15);
    } catch (e) {
      console.log('Logo not embedded in PDF');
    }

    // Title
    doc.setFontSize(36);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 58, 95);
    doc.text('CERTIFICATE OF COMPLETION', 148.5, 60, { align: 'center' });

    // Presentation line
    doc.setFontSize(14);
    doc.setFont('times', 'normal');
    doc.setTextColor(51, 51, 51);
    doc.text('This certificate is proudly presented to:', 148.5, 75, { align: 'center' });

    // Name with underline
    doc.setFontSize(28);
    doc.setFont('times', 'bolditalic');
    doc.setTextColor(30, 58, 95);
    doc.text(userData.name, 148.5, 88, { align: 'center' });
    doc.setLineWidth(0.5);
    doc.line(90, 90, 207, 90);

    // Achievement description
    doc.setFontSize(12);
    doc.setFont('times', 'normal');
    doc.setTextColor(51, 51, 51);
    doc.text('For successfully completing the', 148.5, 100, { align: 'center' });
    doc.setFont('times', 'bold');
    doc.setTextColor(30, 58, 95);
    doc.text('Generator Technician Knowledge Assessment', 148.5, 107, { align: 'center' });

    // Details section
    doc.setFont('times', 'normal');
    doc.setTextColor(51, 51, 51);
    doc.setFontSize(11);
    
    const leftX = 70;
    const rightX = 165;
    let yPos = 122;
    
    // Score
    doc.setFont('times', 'bold');
    doc.text('With a score of:', leftX, yPos);
    doc.setFont('times', 'normal');
    doc.setTextColor(30, 58, 95);
    doc.text(`${results.percentage}%`, rightX, yPos);
    doc.line(rightX, yPos + 1, rightX + 40, yPos + 1);
    
    // Achievement Level
    yPos += 10;
    doc.setTextColor(51, 51, 51);
    doc.setFont('times', 'bold');
    doc.text('Achievement Level:', leftX, yPos);
    doc.setFont('times', 'normal');
    doc.setTextColor(30, 58, 95);
    doc.text(userData.skillLevel, rightX, yPos);
    doc.line(rightX, yPos + 1, rightX + 40, yPos + 1);
    
    // Date
    yPos += 10;
    doc.setTextColor(51, 51, 51);
    doc.setFont('times', 'bold');
    doc.text('Date Completed:', leftX, yPos);
    doc.setFont('times', 'normal');
    doc.setTextColor(30, 58, 95);
    doc.text(new Date().toLocaleDateString(), rightX, yPos);
    doc.line(rightX, yPos + 1, rightX + 40, yPos + 1);
    
    // Time
    yPos += 10;
    doc.setTextColor(51, 51, 51);
    doc.setFont('times', 'bold');
    doc.text('Time to Completion:', leftX, yPos);
    doc.setFont('times', 'normal');
    doc.setTextColor(30, 58, 95);
    doc.text(`${formatTime(timeTaken)} out of 90 minutes`, rightX, yPos);
    doc.line(rightX, yPos + 1, rightX + 40, yPos + 1);

    // Signature section
    yPos = 170;
    doc.setTextColor(51, 51, 51);
    doc.setFontSize(10);
    doc.text('Authorized By:', 50, yPos);
    doc.line(50, yPos + 10, 110, yPos + 10);
    
    doc.text('Date:', 187, yPos);
    doc.line(187, yPos + 10, 247, yPos + 10);

    // Footer
    doc.setFontSize(9);
    doc.setFont('times', 'italic');
    doc.setTextColor(102, 102, 102);
    doc.text('Generator Source • Sales • Rentals • Service', 25, 195);
    doc.setFont('times', 'bolditalic');
    doc.setTextColor(30, 58, 95);
    doc.text('Official Technician Certification', 25, 200);

    return doc;
  };

  const handleSubmitTest = async () => {
    // Calculate time taken
    const timeSpent = (90 * 60) - timeLeft;
    setTimeTaken(timeSpent);
    
    const results = calculateResults();
    setStage('results');

    // Generate certificate PDF first
    const certificate = generateCertificate(results);
    const certificateBase64 = certificate.output('datauristring').split(',')[1]; // Get base64 without data URI prefix

    // Generate detailed report PDF
    const report = generateReport(results, timeSpent);
    const reportBase64 = report.output('datauristring').split(',')[1];

    // Save results to Supabase database with both certificate and report
    // The database trigger will automatically send emails via Edge Function
    try {
      const saveResponse = await fetch(`${SUPABASE_URL}/rest/v1/results`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          applicant_name: userData.name,
          applicant_email: userData.email,
          applicant_phone: userData.phone,
          branch: userData.branch,
          skill_level: userData.skillLevel,
          score: results.correct,
          total_questions: results.total,
          percentage: results.percentage,
          passed: results.passed,
          test_date: new Date().toISOString(),
          time_taken_seconds: timeSpent,
          answers: JSON.stringify(answers),
          certificate_pdf: certificateBase64,  // Save certificate as base64
          report_pdf: reportBase64  // Save report as base64
        })
      });
      
      if (saveResponse.ok) {
        console.log('Results saved successfully.');
        
        // Call Edge Function to send emails
        try {
          const emailResponse = await fetch(`${SUPABASE_URL}/functions/v1/send-test-results-email`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${SUPABASE_KEY}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              record: {
                applicant_name: userData.name,
                applicant_email: userData.email,
                applicant_phone: userData.phone,
                branch: userData.branch,
                skill_level: userData.skillLevel,
                score: results.correct,
                total_questions: results.total,
                percentage: results.percentage,
                passed: results.passed,
                test_date: new Date().toISOString(),
                time_taken_seconds: timeSpent,
                certificate_pdf: certificateBase64,
                report_pdf: reportBase64
              }
            })
          });
          
          if (emailResponse.ok) {
            console.log('Email sent successfully via Edge Function');
          } else {
            console.error('Failed to send email:', await emailResponse.text());
          }
        } catch (emailErr) {
          console.error('Error calling Edge Function:', emailErr);
        }
      } else {
        console.error('Failed to save results to database');
      }
    } catch (err) {
      console.error('Error saving results:', err);
    }
  };

  const downloadCertificate = () => {
    const results = calculateResults();
    const certificate = generateCertificate(results);
    certificate.save(`${userData.name}_Certificate.pdf`);
  };

  const getIncorrectAnswers = () => {
    const incorrect = [];
    questions.forEach((q, index) => {
      if (answers[index] !== q.correct_answer_letter) {
        const userAnswerLetter = answers[index] || 'No answer';
        const userAnswerText = userAnswerLetter !== 'No answer' 
          ? q.options.find(opt => opt.startsWith(userAnswerLetter))?.substring(3) || 'No answer'
          : 'No answer';
        const correctAnswerText = q.options.find(opt => opt.startsWith(q.correct_answer_letter))?.substring(3) || '';
        
        incorrect.push({
          questionNumber: index + 1,
          question: q.question,
          userAnswer: `${userAnswerLetter}) ${userAnswerText}`,
          correctAnswer: `${q.correct_answer_letter}) ${correctAnswerText}`,
          explanation: getExplanationByNumber(index + 1)
        });
      }
    });
    return incorrect;
  };

  // Generate report PDF (returns jsPDF object)
  const generateReport = (results, timeSpent) => {
    const doc = new jsPDF();
    const incorrectAnswers = getIncorrectAnswers();
    
    // Header with dark blue background (matching Generator Source logo)
    doc.setFillColor(30, 58, 95); // Dark navy blue
    doc.rect(0, 0, 210, 40, 'F');
    
    // Logo on left side
    try {
      doc.addImage('/generator-source-logo-blue.jpg', 'JPEG', 15, 10, 35, 11);
    } catch (e) {
      console.log('Logo not embedded in PDF');
    }
    
    // Title text on right side
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text('Detailed Test Report', 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text('Generator Technician Knowledge Test', 105, 30, { align: 'center' });
    
    // Test Information
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    let yPos = 50;
    doc.text(`Name: ${userData.name}`, 20, yPos);
    doc.text(`Email: ${userData.email}`, 20, yPos + 6);
    doc.text(`Branch: ${userData.branch}`, 20, yPos + 12);
    doc.text(`Skill Level: ${userData.skillLevel}`, 20, yPos + 18);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, yPos + 24);
    doc.text(`Time Taken: ${formatTime(timeSpent)}`, 20, yPos + 30);
    doc.text(`Pauses: ${pauseCount}`, 20, yPos + 36);
    
    // Score Summary
    yPos += 50;
    doc.setFontSize(14);
    doc.setTextColor(30, 58, 95);
    doc.text('Score Summary', 20, yPos);
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    yPos += 8;
    doc.text(`Total Questions: ${results.total}`, 20, yPos);
    doc.text(`Correct Answers: ${results.correct}`, 20, yPos + 6);
    doc.text(`Incorrect Answers: ${results.total - results.correct}`, 20, yPos + 12);
    doc.text(`Score: ${results.percentage}%`, 20, yPos + 18);
    doc.text(`Status: ${results.passed ? 'PASSED' : 'NOT PASSED'}`, 20, yPos + 24);
    
    // Incorrect Answers Details
    if (incorrectAnswers.length > 0) {
      yPos += 35;
      doc.setFontSize(14);
      doc.setTextColor(220, 38, 38);
      doc.text('Incorrect Answers Review', 20, yPos);
      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0);
      
      incorrectAnswers.forEach((item, index) => {
        yPos += 10;
        
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        
        doc.setFont(undefined, 'bold');
        const questionLines = doc.splitTextToSize(`Q${item.questionNumber}: ${item.question}`, 170);
        doc.text(questionLines, 20, yPos);
        yPos += questionLines.length * 5;
        
        doc.setFont(undefined, 'normal');
        doc.setTextColor(220, 38, 38);
        doc.text('Your Answer:', 20, yPos);
        doc.setTextColor(0, 0, 0);
        const userAnswerLines = doc.splitTextToSize(item.userAnswer, 150);
        doc.text(userAnswerLines, 50, yPos);
        yPos += Math.max(5, userAnswerLines.length * 5);
        
        doc.setTextColor(34, 197, 94);
        doc.text('Correct Answer:', 20, yPos);
        doc.setTextColor(0, 0, 0);
        const correctAnswerLines = doc.splitTextToSize(item.correctAnswer, 150);
        doc.text(correctAnswerLines, 50, yPos);
        yPos += Math.max(5, correctAnswerLines.length * 5);
        
        doc.setTextColor(37, 99, 235);
        doc.text('Explanation:', 20, yPos);
        doc.setTextColor(0, 0, 0);
        const explanationLines = doc.splitTextToSize(item.explanation, 170);
        doc.text(explanationLines, 20, yPos + 5);
        yPos += explanationLines.length * 5 + 8;
        
        doc.setDrawColor(200, 200, 200);
        doc.line(20, yPos, 190, yPos);
      });
    } else {
      yPos += 35;
      doc.setFontSize(12);
      doc.setTextColor(34, 197, 94);
      doc.text('🎉 Perfect Score! All answers were correct.', 20, yPos);
    }
    
    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(`Generator Source - Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
    }
    
    return doc;
  };

  const downloadReport = () => {
    const results = calculateResults();
    const report = generateReport(results, timeTaken);
    report.save(`${userData.name}_Detailed_Report.pdf`);
  };

  // Show loading while questions are being fetched
  if (loadingQuestions) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block bg-blue-600 text-white px-6 py-2 rounded-full text-sm font-semibold mb-4">
            Generator Source
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Loading Questions...</h2>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  // Landing Page
  if (stage === 'landing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          {/* Header with logo and title in one line */}
          <div className="flex items-center gap-4 mb-12">
            <img src="/generator-source-logo.jpg" alt="Generator Source" className="h-12" />
            <h1 className="text-2xl md:text-3xl font-bold text-[#1e3a5f] whitespace-nowrap">
              Generator Technician Knowledge Test
            </h1>
          </div>

          {/* Info Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Test Purpose</h2>
            <p className="text-gray-600 mb-6">
              This assessment is designed to establish and verify your knowledge and expertise as a generator technician.
            </p>

            <h3 className="text-xl font-bold text-gray-800 mb-3">Test Instructions</h3>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">✓</span>
                You have <strong>90 minutes</strong> to complete <strong>100 questions</strong>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">✓</span>
                Select the best answer for each question
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">✓</span>
                You will receive your results immediately after submission
              </li>
            </ul>
          </div>

          {/* Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={userData.name}
                  onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition"
                  placeholder="John Doe"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={userData.email}
                  onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition"
                  placeholder="john.doe@example.com"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={userData.phone}
                  onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition"
                  placeholder="(555) 123-4567"
                />
              </div>

              {/* Branch Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Select Branch <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { name: 'Brighton, CO', subtitle: 'Colorado Branch' },
                    { name: 'Jacksonville, FL', subtitle: 'Florida Branch' },
                    { name: 'Austin, TX', subtitle: 'Texas Branch' },
                    { name: 'Pensacola, FL', subtitle: 'Florida Branch' }
                  ].map((branch) => (
                    <button
                      key={branch.name}
                      onClick={() => setUserData({ ...userData, branch: branch.name })}
                      className={`p-4 rounded-lg border-2 transition ${
                        userData.branch === branch.name
                          ? 'border-blue-600 bg-blue-600 text-white'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="font-semibold text-sm">{branch.name.split(',')[0]}</div>
                      <div className={`text-xs ${
                        userData.branch === branch.name ? 'text-white' : 'text-gray-600'
                      }`}>{branch.subtitle}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Skill Level */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Skill Level <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { level: 'Level 1', name: 'Beginner' },
                    { level: 'Level 2', name: 'Advanced' },
                    { level: 'Level 3', name: 'Pro' },
                    { level: 'Level 4', name: 'Master' }
                  ].map((skill) => (
                    <button
                      key={skill.level}
                      onClick={() => setUserData({ ...userData, skillLevel: skill.level })}
                      className={`p-4 rounded-lg border-2 transition ${
                        userData.skillLevel === skill.level
                          ? 'border-blue-600 bg-blue-600 text-white'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="font-semibold text-sm">{skill.level}</div>
                      <div className="text-xs">{skill.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Start Button */}
              <button
                onClick={handleStartTest}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-lg font-bold text-lg hover:from-green-600 hover:to-green-700 transition shadow-lg"
              >
                CLICK HERE TO START
              </button>
            </div>
          </div>
          
          {/* DaVinci Footer - bottom right */}
          <div className="fixed bottom-4 right-4 flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-2 rounded-lg shadow-sm">
            <img src="/davinci-logo.png" alt="DaVinci.AI" className="h-8" />
            <span className="text-xs text-gray-500">© 2026</span>
          </div>
        </div>
      </div>
    );
  }

  // Test Page
  if (stage === 'test') {
    const question = questions[currentQuestion];
    const progress = ((currentQuestion + 1) / questions.length) * 100;

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
        {/* Header */}
        <div className="bg-white shadow-md border-b-2 border-blue-100">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold">
                  Generator Source
                </div>
                <div className="text-sm text-gray-600">
                  <div className="font-semibold">{userData.branch}</div>
                  <div>{new Date().toLocaleDateString()}</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-600">
                  <div className="font-semibold">{userData.name}</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`text-2xl font-bold ${timeLeft < 300 ? 'text-red-600' : 'text-gray-800'}`}>
                    {formatTime(timeLeft)}
                  </div>
                  <button
                    onClick={() => {
                      if (!isPaused) setPauseCount(prev => prev + 1);
                      setIsPaused(!isPaused);
                    }}
                    className={`px-4 py-2 rounded-lg font-semibold transition ${
                      isPaused
                        ? 'bg-green-500 hover:bg-green-600 text-white'
                        : 'bg-red-500 hover:bg-red-600 text-white'
                    }`}
                  >
                    {isPaused ? 'RESUME' : 'PAUSE'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-gray-200 h-2">
          <div
            className="bg-blue-600 h-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Question Content */}
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {/* Question Header */}
            <div className="mb-6">
              <div className="text-sm font-semibold text-blue-600 mb-4">
                QUESTION {currentQuestion + 1} of {questions.length}
              </div>
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">
                {question.question}
              </h2>
            </div>

            {/* Options */}
            <div className="space-y-3 mb-8">
              {question.options.map((option, index) => {
                const letter = option.charAt(0);
                const isSelected = answers[currentQuestion] === letter;
                return (
                  <button
                    key={index}
                    onClick={() => !isPaused && handleAnswerSelect(letter)}
                    disabled={isPaused}
                    className={`w-full text-left p-4 rounded-lg border-2 transition ${
                      isPaused ? 'opacity-50 cursor-not-allowed' : ''
                    } ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                    }`}
                  >
                    <span className="font-semibold">{option}</span>
                  </button>
                );
              })}
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center">
              <button
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                ← PREVIOUS
              </button>

              {currentQuestion === questions.length - 1 ? (
                <button
                  onClick={handleSubmitTest}
                  className="px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-bold hover:from-green-600 hover:to-green-700 transition shadow-lg"
                >
                  SUBMIT TEST
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                  NEXT →
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Results Page
  if (stage === 'results') {
    const results = calculateResults();

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-block bg-blue-600 text-white px-6 py-2 rounded-full text-sm font-semibold mb-4">
                Generator Source
              </div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">Test Results</h1>
              <p className="text-gray-600">{userData.name}</p>
            </div>

            {/* Status */}
            <div className={`text-center py-8 rounded-xl mb-8 ${
              results.passed ? 'bg-green-50' : 'bg-red-50'
            }`}>
              <div className={`text-6xl font-bold mb-2 ${
                results.passed ? 'text-green-600' : 'text-red-600'
              }`}>
                {results.passed ? '✓ PASSED' : '✗ NOT PASSED'}
              </div>
              <div className="text-3xl font-bold text-gray-800">
                {results.percentage}%
              </div>
            </div>

            {/* Score Details */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-blue-50 p-6 rounded-xl text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {results.correct}
                </div>
                <div className="text-sm text-gray-600">Correct Answers</div>
              </div>
              <div className="bg-gray-50 p-6 rounded-xl text-center">
                <div className="text-3xl font-bold text-gray-800 mb-2">
                  {results.total - results.correct}
                </div>
                <div className="text-sm text-gray-600">Incorrect Answers</div>
              </div>
              <div className="bg-purple-50 p-6 rounded-xl text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {results.total}
                </div>
                <div className="text-sm text-gray-600">Total Questions</div>
              </div>
            </div>

            {/* Test Info */}
            <div className="bg-gray-50 p-6 rounded-xl mb-8">
              <h3 className="font-bold text-gray-800 mb-4">Test Information</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Branch:</span>
                  <span className="font-semibold ml-2">{userData.branch}</span>
                </div>
                <div>
                  <span className="text-gray-600">Skill Level:</span>
                  <span className="font-semibold ml-2">{userData.skillLevel}</span>
                </div>
                <div>
                  <span className="text-gray-600">Email:</span>
                  <span className="font-semibold ml-2">{userData.email}</span>
                </div>
                <div>
                  <span className="text-gray-600">Date:</span>
                  <span className="font-semibold ml-2">{new Date().toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="text-gray-600">Time Taken:</span>
                  <span className="font-semibold ml-2">{formatTime(timeTaken)}</span>
                </div>
                <div>
                  <span className="text-gray-600">Pauses:</span>
                  <span className="font-semibold ml-2">{pauseCount}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <button
                onClick={downloadCertificate}
                disabled={!results.passed}
                className={`flex-1 py-4 rounded-lg font-bold transition shadow-lg ${
                  results.passed
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 cursor-pointer'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                📄 Download Certificate {!results.passed && '(Pass Required)'}
              </button>
              <button
                onClick={() => window.location.reload()}
                className="flex-1 bg-gray-200 text-gray-700 py-4 rounded-lg font-bold hover:bg-gray-300 transition"
              >
                Take Test Again
              </button>
            </div>

            {/* Report Actions */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <button
                onClick={downloadReport}
                className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-lg font-bold hover:from-green-600 hover:to-green-700 transition shadow-lg"
              >
                ⬇️ Download Detailed Report PDF
              </button>
            </div>

            {/* Detailed Report Section - Always Visible */}
            <div className="mt-8 border-t-2 border-gray-200 pt-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Detailed Answer Report</h3>
              {getIncorrectAnswers().length === 0 ? (
                <div className="bg-green-50 p-6 rounded-xl text-center">
                  <div className="text-green-600 text-xl font-bold mb-2">🎉 Perfect Score!</div>
                  <p className="text-gray-600">You answered all questions correctly. Excellent work!</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {getIncorrectAnswers().map((item, index) => (
                    <div key={index} className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
                      <div className="font-bold text-gray-800 mb-3">
                        Question {item.questionNumber}: {item.question}
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-start">
                          <span className="text-red-600 font-semibold mr-2">Your Answer:</span>
                          <span className="text-gray-700">{item.userAnswer}</span>
                        </div>
                        <div className="flex items-start">
                          <span className="text-green-600 font-semibold mr-2">Correct Answer:</span>
                          <span className="text-gray-700">{item.correctAnswer}</span>
                        </div>
                        <div className="bg-white p-4 rounded-lg mt-3">
                          <span className="text-blue-600 font-semibold">Explanation:</span>
                          <p className="text-gray-700 mt-2">{item.explanation}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>



            {/* Email Notice */}
            <div className="mt-6 text-center text-sm text-gray-600">
              Your results and certificate have been sent to <strong>{userData.email}</strong> on{' '}
              <strong>{new Date().toLocaleDateString()}</strong> at{' '}
              <strong>{new Date().toLocaleTimeString()}</strong>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
