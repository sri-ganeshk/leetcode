import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [data, setData] = useState(null);
  const [solvedSlugs, setSolvedSlugs] = useState(new Set());
  const [collapsedSubCategories, setCollapsedSubCategories] = useState({});

  const fetchSolved = async () => {
    // Use a CORS proxy URL - for development only!
    const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
    const targetUrl = 'https://leetcode.com/graphql';

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
      const response = await fetch(proxyUrl + targetUrl, {
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
      console.log("Fetched solved slugs:", slugs);
      setSolvedSlugs(new Set(slugs));
    } catch (error) {
      console.error('Error fetching solved problems:', error);
    }
  };

  // Fetch problems JSON and initialize collapsed state (minimized by default)
  useEffect(() => {
    fetch('/problems.json')
      .then(response => response.json())
      .then(json => {
        setData(json);
        // Initialize each subcategory as collapsed
        let initialCollapsed = {};
        Object.keys(json).forEach(phase => {
          Object.keys(json[phase]).forEach(subCat => {
            initialCollapsed[`${phase}-${subCat}`] = true;
          });
        });
        setCollapsedSubCategories(initialCollapsed);
      })
      .catch(err => console.error('Error fetching problems JSON:', err));
  }, []);

  useEffect(() => {
    fetchSolved();
  }, []);

  const extractSlug = (url) => {
    const parts = url.split('/');
    let slug = parts.pop() || parts.pop();
    return slug;
  };

  const toggleSubCategory = (phase, subCat) => {
    const key = `${phase}-${subCat}`;
    setCollapsedSubCategories(prev => ({
      ...prev,
      [key]: !prev[key]
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
          Object.keys(data).map(phase => (
            <div key={phase} className="phase">
              <h2 className="phase-title">{phase}</h2>
              {Object.keys(data[phase]).map(subCat => {
                const key = `${phase}-${subCat}`;
                const isCollapsed = collapsedSubCategories[key];
                return (
                  <div key={subCat} className="subcategory">
                    <div
                      onClick={() => toggleSubCategory(phase, subCat)}
                      className="subcategory-header"
                    >
                      <span className="subcategory-title">{subCat}</span>
                      <span>{isCollapsed ? '[+]' : '[-]'}</span>
                    </div>
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
              })}
            </div>
          ))
        ) : (
          <p>Loading problems...</p>
        )}
      </div>
    </div>
  );
}

export default App;
