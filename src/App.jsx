import { useState, useEffect, useRef } from 'react';
import { jsPDF } from 'jspdf';
import questions from './questions.json';

export default function App() {
  const [stage, setStage] = useState('landing'); // landing, test, results
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phone: '',
    branch: '',
    skillLevel: ''
  });
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(75 * 60); // 75 minutes in seconds
  const [isPaused, setIsPaused] = useState(false);
  const [testStartTime, setTestStartTime] = useState(null);
  const timerRef = useRef(null);

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

    // Background
    doc.setFillColor(240, 248, 255);
    doc.rect(0, 0, 297, 210, 'F');

    // Border
    doc.setDrawColor(41, 128, 185);
    doc.setLineWidth(2);
    doc.rect(10, 10, 277, 190);

    // Title
    doc.setFontSize(32);
    doc.setTextColor(41, 128, 185);
    doc.text('CERTIFICATE OF COMPLETION', 148.5, 40, { align: 'center' });

    // Subtitle
    doc.setFontSize(18);
    doc.setTextColor(52, 73, 94);
    doc.text('Generator Technician Knowledge Test', 148.5, 55, { align: 'center' });

    // Presented to
    doc.setFontSize(14);
    doc.text('This certificate is presented to', 148.5, 75, { align: 'center' });

    // Name
    doc.setFontSize(28);
    doc.setTextColor(41, 128, 185);
    doc.text(userData.name, 148.5, 95, { align: 'center' });

    // Details
    doc.setFontSize(12);
    doc.setTextColor(52, 73, 94);
    doc.text(`Score: ${results.correct} out of ${results.total} (${results.percentage}%)`, 148.5, 115, { align: 'center' });
    doc.text(`Branch: ${userData.branch}`, 148.5, 125, { align: 'center' });
    doc.text(`Skill Level: ${userData.skillLevel}`, 148.5, 135, { align: 'center' });
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 148.5, 145, { align: 'center' });

    // Status
    doc.setFontSize(16);
    if (results.passed) {
      doc.setTextColor(39, 174, 96);
      doc.text('✓ PASSED', 148.5, 165, { align: 'center' });
    } else {
      doc.setTextColor(231, 76, 60);
      doc.text('✗ NOT PASSED', 148.5, 165, { align: 'center' });
    }

    // Footer
    doc.setFontSize(10);
    doc.setTextColor(127, 140, 141);
    doc.text('Generator Source', 148.5, 185, { align: 'center' });

    return doc;
  };

  const handleSubmitTest = async () => {
    const results = calculateResults();
    setStage('results');

    // Generate certificate PDF
    const certificate = generateCertificate(results);
    const pdfBlob = certificate.output('blob');

    // Send email via Netlify function
    try {
      const formData = new FormData();
      formData.append('name', userData.name);
      formData.append('email', userData.email);
      formData.append('phone', userData.phone);
      formData.append('branch', userData.branch);
      formData.append('skillLevel', userData.skillLevel);
      formData.append('score', results.correct);
      formData.append('total', results.total);
      formData.append('percentage', results.percentage);
      formData.append('passed', results.passed);
      formData.append('certificate', pdfBlob, 'certificate.pdf');

      await fetch('/.netlify/functions/send-results', {
        method: 'POST',
        body: formData
      });
    } catch (error) {
      console.error('Email sending failed:', error);
    }
  };

  const downloadCertificate = () => {
    const results = calculateResults();
    const certificate = generateCertificate(results);
    certificate.save(`${userData.name}_Certificate.pdf`);
  };

  // Landing Page
  if (stage === 'landing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          {/* Header with logo */}
          <div className="flex items-start mb-8">
            <img src="/generator-source-logo.jpg" alt="Generator Source" className="h-10" />
          </div>
          
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
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
                You have <strong>75 minutes</strong> to complete <strong>100 questions</strong>
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
                          ? 'border-blue-600 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="font-semibold text-sm">{branch.name.split(',')[0]}</div>
                      <div className="text-xs text-gray-600">{branch.subtitle}</div>
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
                    onClick={() => setIsPaused(!isPaused)}
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
              <div className="text-sm font-semibold text-blue-600 mb-2">
                QUESTION {currentQuestion + 1} of {questions.length} | COMPLETE: {Math.round(progress)}%
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
                    onClick={() => handleAnswerSelect(letter)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition ${
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
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={downloadCertificate}
                className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 rounded-lg font-bold hover:from-blue-600 hover:to-blue-700 transition shadow-lg"
              >
                📄 Download Certificate
              </button>
              <button
                onClick={() => window.location.reload()}
                className="flex-1 bg-gray-200 text-gray-700 py-4 rounded-lg font-bold hover:bg-gray-300 transition"
              >
                Take Test Again
              </button>
            </div>

            {/* Email Notice */}
            <div className="mt-6 text-center text-sm text-gray-600">
              Your results and certificate have been sent to <strong>{userData.email}</strong>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
