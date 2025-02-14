import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [data, setData] = useState(null);
  const [solvedSlugs, setSolvedSlugs] = useState(new Set());
  const [collapsedPhases, setCollapsedPhases] = useState({});
  const [collapsedSubCategories, setCollapsedSubCategories] = useState({});

  const fetchSolved = async () => {
    const targetUrl = '/api/leetcode'; // Our Vercel serverless function endpoint
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
      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, variables })
      });
      const result = await response.json();
      if (result.errors) {
        console.error('GraphQL errors:', result.errors);
        return;
      }
      const slugs = result.data.recentAcSubmissionList.map(
        submission => submission.titleSlug
      );
      console.log("Fetched solved slugs:", slugs);
      setSolvedSlugs(new Set(slugs));
    } catch (error) {
      console.error('Error fetching solved problems:', error);
    }
  };

  // Fetch problems JSON and initialize collapsed states
  useEffect(() => {
    fetch('/problems.json')
      .then(response => response.json())
      .then(json => {
        setData(json);
        let initialPhaseCollapsed = {};
        let initialSubCollapsed = {};
        Object.keys(json).forEach(phase => {
          initialPhaseCollapsed[phase] = true; // phases collapsed by default
          Object.keys(json[phase]).forEach(subCat => {
            initialSubCollapsed[`${phase}-${subCat}`] = true; // topics collapsed by default
          });
        });
        setCollapsedPhases(initialPhaseCollapsed);
        setCollapsedSubCategories(initialSubCollapsed);
      })
      .catch(err => console.error('Error fetching problems JSON:', err));
  }, []);

  useEffect(() => {
    fetchSolved();
  }, []);

  // Helper function to extract the slug from a problem URL
  const extractSlug = (url) => {
    const parts = url.split('/');
    let slug = parts.pop() || parts.pop();
    return slug;
  };

  // Toggle a subcategory (topic)
  const toggleSubCategory = (phase, subCat) => {
    const key = `${phase}-${subCat}`;
    setCollapsedSubCategories(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Toggle a phase (e.g., Part 1, Part 2, Part 3)
  const togglePhase = (phase) => {
    setCollapsedPhases(prev => ({
      ...prev,
      [phase]: !prev[phase]
    }));
  };

  return (
    <div className="app">
      <div className="header">
        <h1 className="title">Graph Problems</h1>
        <button onClick={fetchSolved} className="button">
          Update LeetCode Submissions
        </button>
      </div>

      <div className="section">
        {data ? (
          Object.keys(data).map(phase => {
            // Calculate total and solved counts for the entire phase
            let totalPhaseCount = 0;
            let solvedPhaseCount = 0;
            Object.keys(data[phase]).forEach(subCat => {
              totalPhaseCount += data[phase][subCat].length;
              solvedPhaseCount += data[phase][subCat].filter(problem =>
                solvedSlugs.has(extractSlug(problem.url))
              ).length;
            });

            return (
              <div key={phase} className="phase">
                {/* Phase header with collapse toggle and solved count */}
                <h2 
                  className="phase-title" 
                  onClick={() => togglePhase(phase)}
                  style={{ cursor: 'pointer' }}
                >
                  {phase} ({solvedPhaseCount}/{totalPhaseCount} solved) {collapsedPhases[phase] ? '[+]' : '[-]'}
                </h2>
                {/* Only display subcategories if phase is expanded */}
                {!collapsedPhases[phase] && (
                  Object.keys(data[phase]).map(subCat => {
                    const key = `${phase}-${subCat}`;
                    const isCollapsed = collapsedSubCategories[key];
                    // Calculate solved count for each subcategory
                    const totalCount = data[phase][subCat].length;
                    const solvedCount = data[phase][subCat].filter(problem =>
                      solvedSlugs.has(extractSlug(problem.url))
                    ).length;
                    return (
                      <div key={subCat} className="subcategory">
                        <div
                          onClick={() => toggleSubCategory(phase, subCat)}
                          className="subcategory-header"
                          style={{ cursor: 'pointer' }}
                        >
                          <span className="subcategory-title">
                            {subCat} ({solvedCount}/{totalCount} solved)
                          </span>
                          <span>{isCollapsed ? '[+]' : '[-]'}</span>
                        </div>
                        {/* Only display the list of problems if the subcategory is expanded */}
                        {!isCollapsed && (
                          <div className="subcategory-content">
                            {data[phase][subCat].map((problem, index) => {
                              const slug = extractSlug(problem.url);
                              const solved = solvedSlugs.has(slug);
                              return (
                                <div key={index} className="problem">
                                  <a
                                    href={problem.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={solved ? 'problem-solved' : 'problem-unsolved'}
                                  >
                                    {problem.title} {solved && <span>(Solved)</span>}
                                  </a>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            );
          })
        ) : (
          <p>Loading problems...</p>
        )}
      </div>
    </div>
  );
}

export default App;
