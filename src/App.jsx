import React, { useState, useEffect } from 'react';

function App() {
  const [data, setData] = useState(null);
  const [selectedPhase, setSelectedPhase] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState('');
  const [solvedSlugs, setSolvedSlugs] = useState(new Set());

  // Fetch problems.json from the public folder
  useEffect(() => {
    fetch('/problems.json')
      .then(response => response.json())
      .then(json => setData(json))
      .catch(err => console.error('Error fetching problems JSON:', err));
  }, []);

  // Fetch solved problems from LeetCode GraphQL API for user "ganeshknsml"
  useEffect(() => {
    const fetchSolved = async () => {
      const url = 'https://leetcode.com/graphql';
      const query = `
        query recentAcSubmissionList($username: String!, $limit: Int!) {
          recentAcSubmissionList(username: $username, limit: $limit) {
            titleSlug
          }
        }
      `;
      const variables = {
        username: "ganeshknsml",
        limit: 1000
      };

      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query, variables })
        });
        const result = await response.json();
        if (result.errors) {
          console.error('GraphQL errors:', result.errors);
          return;
        }
        const slugs = result.data.recentAcSubmissionList.map(submission => submission.titleSlug);
        setSolvedSlugs(new Set(slugs));
      } catch (error) {
        console.error('Error fetching solved problems:', error);
      }
    };

    fetchSolved();
  }, []);

  // Extract the problem slug from its URL
  const extractSlug = (url) => {
    const parts = url.split('/');
    let slug = parts.pop() || parts.pop(); // Handle potential trailing slash
    return slug;
  };

  const handlePhaseChange = (e) => {
    setSelectedPhase(e.target.value);
    setSelectedSubCategory('');
  };

  const handleSubCategoryChange = (e) => {
    setSelectedSubCategory(e.target.value);
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <h1>Graph Problems</h1>
      
      <div>
        <label htmlFor="phaseDropdown">Select Phase: </label>
        <select id="phaseDropdown" value={selectedPhase} onChange={handlePhaseChange}>
          <option value="">-- Select a Phase --</option>
          {data && Object.keys(data).map(phase => (
            <option key={phase} value={phase}>{phase}</option>
          ))}
        </select>
      </div>
      
      {selectedPhase && data && (
        <div style={{ marginTop: '1rem' }}>
          <label htmlFor="subCategoryDropdown">Select Subcategory: </label>
          <select id="subCategoryDropdown" value={selectedSubCategory} onChange={handleSubCategoryChange}>
            <option value="">-- Select a Subcategory --</option>
            {Object.keys(data[selectedPhase]).map(subCat => (
              <option key={subCat} value={subCat}>{subCat}</option>
            ))}
          </select>
        </div>
      )}

      {selectedSubCategory && data && (
        <div style={{ marginTop: '2rem' }}>
          <h2>{selectedSubCategory}</h2>
          {data[selectedPhase][selectedSubCategory].map((problem, index) => {
            const slug = extractSlug(problem.url);
            const solved = solvedSlugs.has(slug);
            return (
              <div
                key={index}
                style={{
                  padding: '0.5rem',
                  marginBottom: '0.5rem',
                  backgroundColor: solved ? '#d4edda' : 'transparent',
                  border: '1px solid #ccc',
                  borderRadius: '4px'
                }}
              >
                <a
                  href={problem.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ textDecoration: 'none', color: 'blue' }}
                >
                  {problem.title} {solved && <span style={{ color: 'green', fontWeight: 'bold' }}>(Solved)</span>}
                </a>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default App;
