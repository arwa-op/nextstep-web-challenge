import { useEffect, useState } from 'react'

function isValidSituationResult(data) {
  if (!data || typeof data !== 'object') {
    return false
  }

  if (!data.mode || !data.summary) {
    return false
  }

  if (data.mode === 'support') {
    return true
  }

  if (!Array.isArray(data.priorities)) {
    return false
  }

  if (!Array.isArray(data.clarifying_questions)) {
    return false
  }

  return true
}

function App() {
  const [situation, setSituation] = useState(() => {
    return localStorage.getItem('nextstep-situation') || ''
  })

  const [showAllPriorities, setShowAllPriorities] = useState(false)

  const [answers, setAnswers] = useState({})

  const [result, setResult] = useState(() => {
    const savedResult = localStorage.getItem('nextstep-result')

    if (!savedResult) {
      return null
    }

    try {
      return JSON.parse(savedResult)
    } catch {
      localStorage.removeItem('nextstep-result')
      return null
    }
  })

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingStage, setLoadingStage] = useState(1)

  const [situationUpdate, setSituationUpdate] = useState('')
  const [updating, setUpdating] = useState(false)
  const [updateError, setUpdateError] = useState('')

  // Save situation so refresh does not erase it
  useEffect(() => {
    localStorage.setItem('nextstep-situation', situation)
  }, [situation])

  // Save latest result so refresh does not erase the analysis
  useEffect(() => {
    if (result) {
      localStorage.setItem('nextstep-result', JSON.stringify(result))
    }
  }, [result])

  // Sync situation and result between browser tabs
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === 'nextstep-situation') {
        setSituation(event.newValue || '')
      }

      if (event.key === 'nextstep-result') {
        if (!event.newValue) {
          setResult(null)
          return
        }

        try {
          const updatedResult = JSON.parse(event.newValue)

          if (isValidSituationResult(updatedResult)) {
            setResult(updatedResult)
          }
        } catch {
          console.error('Could not sync the updated result.')
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  const handleSubmit = async () => {
    if (!situation.trim()) {
      return
    }

    setLoading(true)
    setError('')
    setResult(null)

    // Remove previous analysis before starting a new one
    localStorage.removeItem('nextstep-result')

    setLoadingStage(1)
    setShowAllPriorities(false)
    setAnswers({})
    setUpdateError('')
    setSituationUpdate('')

    setTimeout(() => {
      setLoadingStage(2)
    }, 5000)

    setTimeout(() => {
      setLoadingStage(3)
    }, 10000)

    try {
      const response = await fetch(
        'https://nextstepmockapi.onrender.com/v1/situations',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Candidate-Id': import.meta.env.VITE_CANDIDATE_ID,
          },
          body: JSON.stringify({
            text: situation,
            locale: 'en-IN',
            client_time: new Date().toISOString(),
          }),
        },
      )

      if (!response.ok) {
        throw new Error('The service could not process your situation.')
      }

      const data = await response.json()

      console.log('API RESPONSE:', data)

      if (!isValidSituationResult(data)) {
        throw new Error('The response was incomplete.')
      }

      setResult(data)
    } catch (error) {
      console.error(error)

      setError(
        "We couldn't make sense of this yet. Your situation is still here, so you can try again.",
      )
    } finally {
      setLoading(false)
    }
  }

  const handleSituationUpdate = async () => {
    if (!situationUpdate.trim() || !result?.situation_id) {
      return
    }

    setUpdating(true)
    setUpdateError('')

    try {
      const response = await fetch(
        `https://nextstepmockapi.onrender.com/v1/situations/${result.situation_id}/updates`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Candidate-Id': import.meta.env.VITE_CANDIDATE_ID,
          },
          body: JSON.stringify({
            text: situationUpdate,
            client_time: new Date().toISOString(),
          }),
        },
      )

      if (!response.ok) {
        throw new Error('The update could not be processed.')
      }

      const data = await response.json()

      console.log('UPDATED API RESPONSE:', data)

      if (!isValidSituationResult(data)) {
        throw new Error('The updated response was incomplete.')
      }

      setAnswers({})
      setResult(data)
      setSituationUpdate('')
    } catch (error) {
      console.error(error)

      setUpdateError(
        "We couldn't apply that update yet. Your current situation is still here, so you can try again.",
      )
    } finally {
      setUpdating(false)
    }
  }

  return (
    <main className="app">
      <header className="header">
        <h1>NextStep</h1>

        <p>Figure out what to do next.</p>
      </header>

      <section className="input-section">
        <label htmlFor="situation">What's going on?</label>

        <textarea
          id="situation"
          value={situation}
          onChange={(e) => setSituation(e.target.value)}
          placeholder="Tell us what's happening..."
          rows="7"
        />

        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading || !situation.trim()}
        >
          {loading ? 'Understanding...' : 'Understand my situation'}
        </button>
      </section>

      {error && (
        <div className="error-message" role="alert">
          {error}
        </div>
      )}

      {loading && (
        <section className="loading" aria-live="polite">
          <h2>Let's make sense of this.</h2>

          <p>
            {loadingStage === 1 && "We're looking at what matters most first."}

            {loadingStage === 2 &&
              "We're organizing what needs attention first."}

            {loadingStage === 3 &&
              "This is taking a little longer than usual. We're still working on it."}
          </p>

          <div className="loading-bar"></div>
        </section>
      )}

      {result && !loading && (
        <>
          <div className="sr-only" role="status">
            {result.mode === 'support'
              ? 'Your situation has been analyzed. Support information is ready.'
              : 'Your situation has been analyzed. Your next step is ready.'}
          </div>

          <section className="results">
            {result.mode === 'support' ? (
              <div className="result-card">
                <span>TAKE A MOMENT</span>

                <h2>{result.summary}</h2>

                <p>{result.support?.message}</p>

                <p>{result.support?.offer_to_continue}</p>
              </div>
            ) : (
              <>
                {result.next_action && (
                  <div className="result-card next-action">
                    <span>NEXT ACTION</span>

                    <h2>{result.next_action.text}</h2>

                    <p>{result.next_action.why}</p>
                  </div>
                )}

                <div className="result-card">
                  <span>YOUR SITUATION</span>

                  <h2>{result.summary}</h2>
                </div>

                <div className="result-card situation-update">
                  <span>SOMETHING CHANGED?</span>

                  <h2>Tell us what happened.</h2>

                  <textarea
                    value={situationUpdate}
                    onChange={(e) => setSituationUpdate(e.target.value)}
                    placeholder="For example: My laptop is fixed, but the deadline moved to Monday."
                    rows="4"
                  />

                  <button
                    type="button"
                    onClick={handleSituationUpdate}
                    disabled={updating || !situationUpdate.trim()}
                  >
                    {updating ? 'Reassessing...' : 'Update my situation'}
                  </button>

                  {updateError && (
                    <p className="update-error" role="alert">
                      {updateError}
                    </p>
                  )}
                </div>

                {result.changes && result.changes.length > 0 && (
                  <div className="result-card changes">
                    <span>WHAT CHANGED</span>

                    {result.changes.map((change, index) => (
                      <div key={index} className="change-item">
                        <h2>{change.field}</h2>

                        <p>
                          <strong>From:</strong> {change.from}
                        </p>

                        <p>
                          <strong>To:</strong> {change.to}
                        </p>

                        <p>{change.reason}</p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="result-card priority">
                  <span>WHAT MATTERS FIRST</span>

                  {(result.priorities || [])
                    .slice(0, showAllPriorities ? result.priorities.length : 2)
                    .map((priority) => (
                      <div key={`${priority.rank}-${priority.issue_id}`}>
                        <h2>{priority.action}</h2>

                        <p>{priority.reason}</p>
                      </div>
                    ))}

                  {(result.priorities || []).length > 2 && !showAllPriorities && (
                    <button
                      type="button"
                      onClick={() => setShowAllPriorities(true)}
                    >
                      See other priorities
                    </button>
                  )}
                </div>

                <div className="questions">
                  <h2>A little more information</h2>

                  {(result.clarifying_questions || []).map((question) => (
                    <div className="question" key={question.id}>
                      <p>{question.question}</p>

                      {question.options.map((option) => (
                        <button
                          key={option}
                          type="button"
                          className={
                            answers[question.id] === option
                              ? 'selected-option'
                              : ''
                          }
                          onClick={() =>
                            setAnswers((previous) => ({
                              ...previous,
                              [question.id]: option,
                            }))
                          }
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              </>
            )}
          </section>
        </>
      )}
    </main>
  )
}

export default App
