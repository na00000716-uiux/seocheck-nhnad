import { useState } from 'react';
import { trpc } from '../lib/trpc';

export function Home() {
  const [url, setUrl] = useState('');
  const [keyword, setKeyword] = useState('');
  const [showToast, setShowToast] = useState<{type: 'success' | 'error', message: string} | null>(null);

  const analyzeMutation = trpc.seo.analyze.useMutation({
    onSuccess: () => {
      setShowToast({ type: 'success', message: '분석 완료!' });
      setTimeout(() => setShowToast(null), 3000);
    },
    onError: (error) => {
      setShowToast({ type: 'error', message: error.message });
      setTimeout(() => setShowToast(null), 5000);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      setShowToast({ type: 'error', message: 'URL을 입력해주세요' });
      setTimeout(() => setShowToast(null), 3000);
      return;
    }

    analyzeMutation.mutate({
      url: url.trim(),
      keyword: keyword.trim() || undefined,
    });
  };

  const result = analyzeMutation.data;
  const isLoading = analyzeMutation.isPending;

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Toast */}
      {showToast && (
        <div className="toast-container">
          <div className={`toast ${showToast.type}`}>
            {showToast.message}
          </div>
        </div>
      )}

      {/* Header */}
      <header>
        <div className="container">
          <div className="header-content">
            <div className="logo">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{width: '1.5rem', height: '1.5rem'}}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div className="header-title">
              <h1>SEO 진단 툴 (네이버 가이드 기반)</h1>
              <div className="header-subtitle">공식 가이드 기반 참고용 진단 도구</div>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="container">
        {/* Disclaimer */}
        <div className="alert">
          <svg className="alert-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="alert-content">
            <strong>🚨 중요: 본 진단은 참고용 분석입니다</strong>
            <ul>
              <li><strong>본 툴은 네이버 공식 도구가 아닙니다.</strong> NAVER Corp.와 무관한 독립 도구입니다.</li>
              <li>공개 HTML 기반의 참고용 분석으로, <strong>네이버 확장검색(애드부스트) 노출을 보장하지 않습니다.</strong></li>
              <li>
                <a href="https://searchadvisor.naver.com/" target="_blank" rel="noopener noreferrer">
                  네이버 서치어드바이저
                </a>
                에서 공식 진단을 받으세요.
              </li>
            </ul>
          </div>
        </div>

        {/* Input Form */}
        <div className="card">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="url" className="form-label">분석할 URL</label>
              <input
                id="url"
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                className="form-input"
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="keyword" className="form-label">타겟 키워드 (선택사항, 최대 5개)</label>
              <input
                id="keyword"
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="예: 네이버 SEO, 검색엔진 최적화"
                className="form-input"
                disabled={isLoading}
              />
              <div className="form-hint">쉼표(,)로 구분하여 여러 키워드를 입력할 수 있습니다</div>
            </div>

            <button type="submit" disabled={isLoading} className="btn">
              {isLoading ? (
                <>
                  <div className="spinner" />
                  분석 중...
                </>
              ) : (
                <>
                  <svg style={{width: '1.25rem', height: '1.25rem'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  SEO 진단 시작
                </>
              )}
            </button>
          </form>
        </div>

        {/* Results */}
        {result && (
          <>
            {/* Summary */}
            <div className="card">
              <h2>진단 결과 요약</h2>
              <div className="summary-grid">
                <div className="summary-item total">
                  <div className="summary-value">{result.summary.total}</div>
                  <div className="summary-label">총 항목</div>
                </div>
                <div className="summary-item good">
                  <div className="summary-value">{result.summary.good}</div>
                  <div className="summary-label">양호</div>
                </div>
                <div className="summary-item warning">
                  <div className="summary-value">{result.summary.recommended}</div>
                  <div className="summary-label">권장</div>
                </div>
                <div className="summary-item error">
                  <div className="summary-value">{result.summary.needs_improvement}</div>
                  <div className="summary-label">개선 필요</div>
                </div>
              </div>
            </div>

            {/* Optimization Score */}
            {result.optimization_score && (
              <div className="card">
                <h2>확장검색 최적화 점수</h2>
                <div className="score-card">
                  <div className="score-value">{result.optimization_score.total_score}</div>
                  <div className="score-grade">{result.optimization_score.grade}</div>
                </div>
                <div className="score-disclaimer">{result.optimization_score.disclaimer}</div>
              </div>
            )}

            {/* Categories */}
            {result.categories.map((category, idx) => (
              <div key={idx} className="card">
                <div className="category">
                  <h3>{category.name}</h3>
                  {category.items.map((item, itemIdx) => (
                    <div
                      key={itemIdx}
                      className={`seo-item ${
                        item.status === 'good' ? 'good' : item.status === 'recommended' ? 'warning' : 'error'
                      }`}
                    >
                      <svg className={`seo-icon ${item.status === 'good' ? 'good' : item.status === 'recommended' ? 'warning' : 'error'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {item.status === 'good' ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        ) : item.status === 'recommended' ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        )}
                      </svg>
                      <div className="seo-content">
                        <div className="seo-title">{item.title}</div>
                        <div className="seo-message">{item.message}</div>
                        {item.details && (
                          <div className="seo-details">{item.details}</div>
                        )}
                        <a href={item.guide_url} target="_blank" rel="noopener noreferrer" className="seo-guide">
                          가이드 보기
                          <svg className="guide-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </>
        )}
      </main>

      {/* Footer */}
      <footer>
        <div className="container">
          <div className="footer-content">
            <p>네이버 서치어드바이저 공식 가이드 기반 참고용 진단 도구</p>
            <p>본 도구는 NAVER Corp.와 무관한 독립 도구입니다</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
