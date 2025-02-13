import React, { useState, useEffect } from 'react';

function App() {
  const [data, setData] = useState(null);
  const [selectedPhase, setSelectedPhase] = useState('');
  const [solvedSlugs, setSolvedSlugs] = useState(new Set());
  const [collapsedSubCategories, setCollapsedSubCategories] = useState({});

  // Function to fetch solved problems from LeetCode GraphQL API for user "ganeshknsml"
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

  // Fetch problems.json from the public folder once on mount
  useEffect(() => {
    fetch('/problems.json')
      .then(response => response.json())
      .then(json => setData(json))
      .catch(err => console.error('Error fetching problems JSON:', err));
  }, []);

  // Fetch solved problems when component mounts
  useEffect(() => {
    fetchSolved();
  }, []);

  // Extract the problem slug from its URL
  const extractSlug = (url) => {
    const parts = url.split('/');
    let slug = parts.pop() || parts.pop(); // Handle potential trailing slash
    return slug;
  };

  // Handle Phase dropdown change
  const handlePhaseChange = (e) => {
    setSelectedPhase(e.target.value);
    // Reset any collapsed state when a new phase is selected
    setCollapsedSubCategories({});
  };

  // Toggle collapse/expand for a given subcategory
  const toggleSubCategory = (subCat) => {
    setCollapsedSubCategories(prev => ({
      ...prev,
      [subCat]: !prev[subCat]
    }));
  };

  // Some basic CSS styles
  const styles = {
    container: {
      padding: '2rem',
      fontFamily: 'Arial, sans-serif'
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    dropdownContainer: {
      marginTop: '1rem'
    },
    subCatHeading: {
      backgroundColor: '#f1f1f1',
      padding: '0.5rem',
      cursor: 'pointer',
      borderRadius: '4px',
      marginTop: '1rem'
    },
    problemItem: {
      padding: '0.5rem',
      marginBottom: '0.5rem',
      border: '1px solid #ccc',
      borderRadius: '4px'
    },
    solvedProblem: {
      backgroundColor: '#c8e6c9'  // a more distinct green
    },
    updateButton: {
      padding: '0.5rem 1rem',
      backgroundColor: '#007bff',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>Graph Problems</h1>
        <button onClick={fetchSolved} style={styles.updateButton}>
          Update LeetCode Submissions
        </button>
      </div>

      <div style={styles.dropdownContainer}>
        <label htmlFor="phaseDropdown">Select Phase: </label>
        <select id="phaseDropdown" value={selectedPhase} onChange={handlePhaseChange}>
          <option value="">-- Select a Phase --</option>
          {data && Object.keys(data).map(phase => (
            <option key={phase} value={phase}>{phase}</option>
          ))}
        </select>
      </div>

      {/* Once a phase is selected, display all subcategories as collapsible sections */}
      {selectedPhase && data && (
        <div style={{ marginTop: '2rem' }}>
          {Object.keys(data[selectedPhase]).map(subCat => (
            <div key={subCat}>
              <div
                onClick={() => toggleSubCategory(subCat)}
                style={styles.subCatHeading}
              >
                <strong>{subCat}</strong> {collapsedSubCategories[subCat] ? '[+]' : '[-]'}
              </div>
              {/* Only show problems if the subcategory is not collapsed */}
              {!collapsedSubCategories[subCat] && (
                <div style={{ marginTop: '0.5rem', paddingLeft: '1rem' }}>
                  {data[selectedPhase][subCat].map((problem, index) => {
                    const slug = extractSlug(problem.url);
                    const solved = solvedSlugs.has(slug);
                    return (
                      <div
                        key={index}
                        style={{
                          ...styles.problemItem,
                          ...(solved ? styles.solvedProblem : {})
                        }}
                      >
                        <a
                          href={problem.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ textDecoration: 'none', color: solved ? 'green' : 'blue' }}
                        >
                          {problem.title} {solved && <span style={{ color: 'green', fontWeight: 'bold' }}>(Solved)</span>}
                        </a>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
