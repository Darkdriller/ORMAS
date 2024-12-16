import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, ArrowLeft, Gift } from 'lucide-react';
import { Link } from 'react-router-dom';
import { saveFeedback } from '../services/feedbackService';
import { districts, areasOfInterest, surveyQuestions } from '../constants/feedbackConstants';

export const Feedback = () => {
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [submittedData, setSubmittedData] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    gender: '',
    email: '',
    mobile: '',
    location: '',
    areaOfInterest: '',
    responses: [] as Array<{ question: string; answer: string }>,
    additionalFeedback: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const responses = surveyQuestions.map((question, index) => ({
      question,
      answer: (document.querySelector(`input[name="question-${index}"]:checked`) as HTMLInputElement)?.value || ''
    }));

    const feedbackData = {
      ...formData,
      responses
    };

    const savedFeedback = saveFeedback(feedbackData);
    setSubmittedData(savedFeedback);
    setFeedbackSubmitted(true);
  };

  if (feedbackSubmitted) {
    return (
      <motion.div 
        className="min-h-screen bg-gradient-to-b from-navy-50 to-navy-100 p-4 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="bg-white rounded-xl p-8 shadow-lg text-center max-w-md w-full">
          <MessageSquare className="w-16 h-16 text-navy-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-navy-800 mb-4">Thank You!</h2>
          <p className="text-navy-600 mb-6">
            Your feedback is valuable to us and will help improve future exhibitions.
          </p>
          <Link 
            to="/"
            className="inline-block bg-navy-600 text-white px-6 py-2 rounded-lg hover:bg-navy-700 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-navy-50 to-navy-100 p-4">
      <Link to="/" className="inline-flex items-center text-navy-600 mb-6">
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back to Home
      </Link>

      <motion.div
        className="max-w-2xl mx-auto bg-white rounded-xl p-6 shadow-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 mb-6">
          <MessageSquare className="w-8 h-8 text-navy-600" />
          <h1 className="text-2xl font-bold text-navy-800">Visitor Feedback</h1>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1">Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-navy-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1">Gender</label>
              <select
                required
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-navy-500 focus:border-transparent"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1">Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-navy-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1">Mobile</label>
              <input
                type="tel"
                required
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-navy-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1">District</label>
              <select
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-navy-500 focus:border-transparent"
              >
                <option value="">Select District</option>
                {districts.map(district => (
                  <option key={district} value={district}>{district}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1">Area of Interest</label>
              <select
                required
                value={formData.areaOfInterest}
                onChange={(e) => setFormData({ ...formData, areaOfInterest: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-navy-500 focus:border-transparent"
              >
                <option value="">Select Area</option>
                {areasOfInterest.map(area => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-semibold text-navy-800 mb-4">Survey Questions</h2>
            {surveyQuestions.map((question, index) => (
              <div key={index} className="mb-4">
                <p className="text-navy-700 mb-2">{question}</p>
                <div className="flex gap-4">
                  {['Very Satisfied', 'Satisfied', 'Neutral', 'Dissatisfied', 'Very Dissatisfied'].map((rating) => (
                    <label key={rating} className="flex items-center">
                      <input
                        type="radio"
                        name={`question-${index}`}
                        value={rating}
                        required
                        className="mr-1"
                      />
                      <span className="text-sm text-navy-600">{rating}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-navy-700 mb-1">
              Additional Feedback (Optional)
            </label>
            <textarea
              value={formData.additionalFeedback}
              onChange={(e) => setFormData({ ...formData, additionalFeedback: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-navy-500 focus:border-transparent"
              rows={4}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-navy-600 text-white py-3 rounded-lg font-semibold hover:bg-navy-700 transition-colors"
          >
            Submit Feedback
          </button>
        </form>
      </motion.div>
    </div>
  );
};