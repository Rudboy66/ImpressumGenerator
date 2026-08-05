"use client";

import { FormEvent, useMemo, useState } from "react";

type Answers = {
  legalForm: string;
  legalName: string;
  brandName: string;
  street: string;
  zip: string;
  city: string;
  country: string;
  email: string;
  representative: string;
  representativeRole: string;
  registerCourt: string;
  registerNumber: string;
  vatStatus: string;
  vatId: string;
  consumers: string;
  employeeCount: string;
  dispute: string;
  editorial: string;
  editorName: string;
  regulatedStatus: string;
  profession: string;
  awardCountry: string;
  chamber: string;
  permitStatus: string;
  authority: string;
  audiovisualStatus: string;
  mediaAuthority: string;
};

type WebsiteAnalysis = {
  brand: string;
  summary: string;
  businessModel: string;
  audience: string[];
  offerings: string[];
  siteTypes: string[];
  reasons: string[];
  confidence: number;
  operatingPurpose?: string;
  monetization?: string[];
  userJourney?: string[];
  legalRelevanceSummary?: string;
  coverageNotes?: string[];
  signals: {
    commercial: boolean;
    shop: boolean;
    services: boolean;
    platform: boolean;
    editorial: boolean;
    audiovisualPrimary: boolean;
    regulatedProfession: boolean;
    permitRequired: boolean;
    consumersPossible: boolean;
  };
};

type QuestionAssessment = {
  id: keyof Answers;
  state: "resolved" | "confirm" | "ask" | "omit";
  suggestedValue: string;
  confidence: number;
  reason: string;
  evidence: string[];
  sourceUrls: string[];
};

type ScannedPage = {
  url: string;
  title: string;
};

const emptyAnalysis: WebsiteAnalysis = {
  brand: "Ihre Website",
  summary: "",
  businessModel: "",
  audience: [],
  offerings: [],
  siteTypes: [],
  reasons: [],
  confidence: 0,
  signals: {
    commercial: true,
    shop: false,
    services: true,
    platform: false,
    editorial: false,
    audiovisualPrimary: false,
    regulatedProfession: false,
    permitRequired: false,
    consumersPossible: false,
  },
};

const initialAnswers: Answers = {
  legalForm: "sole",
  legalName: "",
  brandName: "",
  street: "",
  zip: "",
  city: "",
  country: "Deutschland",
  email: "",
  representative: "",
  representativeRole: "Geschäftsführung",
  registerCourt: "",
  registerNumber: "",
  vatStatus: "no",
  vatId: "",
  consumers: "no",
  employeeCount: "0-10",
  dispute: "no",
  editorial: "no",
  editorName: "",
  regulatedStatus: "yes",
  profession: "",
  awardCountry: "Deutschland",
  chamber: "",
  permitStatus: "yes",
  authority: "",
  audiovisualStatus: "yes",
  mediaAuthority: "",
};

const legalForms: Record<string, string> = {
  person: "Privatperson",
  sole: "Einzelunternehmen",
  gbr: "GbR",
  gmbh: "GmbH",
  ug: "UG (haftungsbeschränkt)",
  ag: "AG",
  verein: "eingetragener Verein",
};

const registeredForms = new Set(["gmbh", "ug", "ag", "verein"]);
const representedForms = new Set(["gmbh", "ug", "ag", "verein"]);

function Info({ text }: { text: string }) {
  return (
    <span className="info" tabIndex={0} aria-label={text}>
      i
      <span className="tooltip" role="tooltip">
        {text}
      </span>
    </span>
  );
}

function FieldLabel({
  children,
  help,
  assessment,
}: {
  children: React.ReactNode;
  help?: string;
  assessment?: QuestionAssessment;
}) {
  return (
    <label className="field-label">
      <span>
        {children} {help && <Info text={help} />}
        {assessment && assessment.state !== "omit" && (
          <span
            className={`ai-cue ${assessment.state}`}
            title={assessment.reason}
          >
            {assessment.state === "confirm"
              ? "KI-Vorschlag · bitte prüfen"
              : assessment.state === "resolved"
                ? "von KI erkannt"
                : "noch offen"}
          </span>
        )}
      </span>
    </label>
  );
}

export default function Home() {
  const [url, setUrl] = useState("");
  const [urlError, setUrlError] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [resultOpen, setResultOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [profile, setProfile] = useState<WebsiteAnalysis>(emptyAnalysis);
  const [summaryDraft, setSummaryDraft] = useState("");
  const [scannedPages, setScannedPages] = useState<ScannedPage[]>([]);
  const [questionPlan, setQuestionPlan] = useState<QuestionAssessment[]>([]);
  const [auditSummary, setAuditSummary] = useState("");
  const [analysisWarnings, setAnalysisWarnings] = useState<string[]>([]);
  const [answers, setAnswers] = useState(initialAnswers);

  const assessmentById = useMemo(
    () =>
      Object.fromEntries(questionPlan.map((item) => [item.id, item])) as Partial<
        Record<keyof Answers, QuestionAssessment>
      >,
    [questionPlan]
  );

  const resolvedQuestions = questionPlan.filter(
    (item) => item.state === "resolved" && item.suggestedValue
  );
  const openQuestionCount = questionPlan.filter(
    (item) => item.state === "ask" || item.state === "confirm"
  ).length;

  const isRegistered = registeredForms.has(answers.legalForm);
  const needsRepresentative = representedForms.has(answers.legalForm);

  const imprint = useMemo(() => {
    const lines = [
      "Impressum",
      "",
      "Angaben gemäß § 5 DDG",
      "",
      answers.legalName,
    ];

    if (
      answers.brandName &&
      answers.brandName.toLowerCase() !== answers.legalName.toLowerCase()
    ) {
      lines.push(`handelnd unter „${answers.brandName}“`);
    }

    lines.push(
      answers.street,
      `${answers.zip} ${answers.city}`,
      answers.country,
      ""
    );

    if (needsRepresentative && answers.representative) {
      lines.push(
        "Vertretung",
        `${answers.representativeRole}: ${answers.representative}`,
        ""
      );
    }

    lines.push("Kontakt", `E-Mail: ${answers.email}`, "");

    if (isRegistered && answers.registerCourt && answers.registerNumber) {
      lines.push(
        "Registereintrag",
        `Registergericht: ${answers.registerCourt}`,
        `Registernummer: ${answers.registerNumber}`,
        ""
      );
    }

    if (answers.vatStatus === "yes" && answers.vatId) {
      lines.push(
        "Umsatzsteuer-ID",
        `Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG: ${answers.vatId}`,
        ""
      );
    }

    if (answers.editorial === "yes" && answers.editorName) {
      lines.push(
        "Redaktionell verantwortlich",
        `${answers.editorName}, ${answers.street}, ${answers.zip} ${answers.city}`,
        ""
      );
    }

    if (answers.regulatedStatus === "yes" && answers.profession) {
      lines.push(
        "Berufsrechtliche Angaben",
        `Berufsbezeichnung: ${answers.profession}`,
        `Verliehen in: ${answers.awardCountry}`,
        ...(answers.chamber ? [`Zuständige Kammer: ${answers.chamber}`] : []),
        ""
      );
    }

    if (answers.permitStatus === "yes" && answers.authority) {
      lines.push("Zuständige Aufsichtsbehörde", answers.authority, "");
    }

    if (answers.audiovisualStatus === "yes" && answers.mediaAuthority) {
      lines.push(
        "Audiovisueller Mediendienst",
        `Sitzland: ${answers.country}`,
        `Zuständige Regulierungsbehörde: ${answers.mediaAuthority}`,
        ""
      );
    }

    if (
      answers.consumers === "yes" &&
      (answers.employeeCount === "more" || answers.dispute === "yes")
    ) {
      lines.push(
        "Verbraucherstreitbeilegung",
        answers.dispute === "yes"
          ? "Wir sind zur Teilnahme an einem Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle bereit."
          : "Wir sind nicht bereit und nicht verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.",
        ""
      );
    }

    return lines.filter((line, index) => line || lines[index - 1]).join("\n").trim();
  }, [answers, isRegistered, needsRepresentative]);

  function update(field: keyof Answers, value: string) {
    setAnswers((current) => ({ ...current, [field]: value }));
  }

  function needsQuestion(field: keyof Answers) {
    const state = assessmentById[field]?.state;
    return state !== "resolved" && state !== "omit";
  }

  function toggleSignal(
    signal: keyof WebsiteAnalysis["signals"]
  ) {
    setProfile((current) => {
      const signals = {
        ...current.signals,
        [signal]: !current.signals[signal],
      };
      if (["shop", "services", "platform"].includes(signal)) {
        signals.commercial =
          signals.shop || signals.services || signals.platform;
      }
      return { ...current, signals };
    });
  }

  async function analyzeWebsite(event: FormEvent) {
    event.preventDefault();
    setUrlError("");

    try {
      new URL(url.startsWith("http") ? url : `https://${url}`);
    } catch {
      setUrlError("Bitte geben Sie eine gültige Webadresse ein.");
      return;
    }

    setAnalyzing(true);
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = (await response.json()) as {
        analysis?: WebsiteAnalysis;
        scannedPages?: ScannedPage[];
        questionPlan?: QuestionAssessment[];
        auditSummary?: string;
        warnings?: string[];
        error?: string;
      };
      if (!response.ok || !data.analysis) {
        throw new Error(data.error || "Die Website konnte nicht geprüft werden.");
      }

      setProfile(data.analysis);
      setSummaryDraft(data.analysis.summary);
      setScannedPages(data.scannedPages ?? []);
      const plan = data.questionPlan ?? [];
      const suggestions = Object.fromEntries(
        plan
          .filter(
            (item) =>
              item.state !== "omit" &&
              item.suggestedValue &&
              item.id in initialAnswers
          )
          .map((item) => [item.id, item.suggestedValue])
      ) as Partial<Answers>;
      setQuestionPlan(plan);
      setAuditSummary(data.auditSummary ?? "");
      setAnalysisWarnings(data.warnings ?? []);
      setAnswers({
        ...initialAnswers,
        ...suggestions,
        brandName: data.analysis.brand,
        ...(suggestions.brandName
          ? { brandName: suggestions.brandName }
          : {}),
      });
      setStep(0);
      setDialogOpen(true);
    } catch (error) {
      setUrlError(
        error instanceof Error
          ? error.message
          : "Die Website konnte nicht geprüft werden."
      );
    } finally {
      setAnalyzing(false);
    }
  }

  function nextStep(event: FormEvent) {
    event.preventDefault();
    if (step === 0) {
      setProfile((current) => ({ ...current, summary: summaryDraft }));
    }
    if (step < 3) {
      setStep((current) => current + 1);
      return;
    }
    setDialogOpen(false);
    setResultOpen(true);
  }

  async function copyImprint() {
    await navigator.clipboard.writeText(imprint);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <main className="site-shell">
      <nav className="nav">
        <a className="brand" href="#" aria-label="Imprintly Startseite">
          <span className="brand-mark">I</span>
          Imprintly
        </a>
        <span className="nav-note">Impressum in wenigen Minuten</span>
      </nav>

      <section className="hero">
        <div className="eyebrow">Einfach. Geführt. Verständlich.</div>
        <h1>Von Ihrer Website zum fertigen Impressum.</h1>
        <p className="hero-copy">
          Wir schauen uns Ihre Website an und fragen nur nach Angaben, die dort
          nicht sicher zu finden sind.
        </p>

        <form className="url-card" onSubmit={analyzeWebsite}>
          <div className="url-heading">
            <span className="step-badge">1</span>
            <div>
              <strong>Welche Website sollen wir prüfen?</strong>
              <span>Eine Webadresse genügt für den Start.</span>
            </div>
          </div>
          <div className="url-row">
            <div className="url-input-wrap">
              <span className="globe" aria-hidden="true">◎</span>
              <input
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                placeholder="z. B. socelia.de"
                aria-label="Webadresse"
                required
              />
            </div>
            <button className="primary-button" type="submit" disabled={analyzing}>
              {analyzing ? "Website wird vollständig geprüft …" : "Website prüfen"}
              {!analyzing && <span aria-hidden="true">→</span>}
            </button>
          </div>
          {urlError && <p className="error">{urlError}</p>}
          <p className="privacy-note">
            <span aria-hidden="true">◇</span> Für diese Demo wird keine Eingabe
            gespeichert.
          </p>
        </form>

        <div className="process">
          <div className="process-item active">
            <span>01</span>
            <strong>Website prüfen</strong>
            <small>Inhalte einordnen</small>
          </div>
          <div className="process-line" />
          <div className="process-item">
            <span>02</span>
            <strong>Offene Angaben</strong>
            <small>Nur das Nötigste</small>
          </div>
          <div className="process-line" />
          <div className="process-item">
            <span>03</span>
            <strong>Impressum kopieren</strong>
            <small>Direkt einsetzbar</small>
          </div>
        </div>
      </section>

      <footer>
        <span>Demo eines automatisierten Impressum-Generators</span>
        <span>Kein Ersatz für eine Rechtsberatung</span>
      </footer>

      {dialogOpen && (
        <div className="modal-backdrop" role="presentation">
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="question-title"
          >
            <div className="modal-top">
              <div>
                <span className="modal-kicker">
                  {step === 0 ? "Website-Verständnis" : `Fragen ${step} von 3`}
                </span>
                <h2 id="question-title">
                  {step === 0 && "Haben wir Ihre Website richtig verstanden?"}
                  {step === 1 && "Wer steht hinter der Website?"}
                  {step === 2 && "Wo ist der Anbieter erreichbar?"}
                  {step === 3 && "Nur noch ein paar kurze Fragen"}
                </h2>
              </div>
              <button
                className="close-button"
                type="button"
                onClick={() => setDialogOpen(false)}
                aria-label="Fenster schließen"
              >
                ×
              </button>
            </div>

            {step > 0 && (
              <div className="analysis-note">
                <span className="scan-icon">✓</span>
                <div>
                  <strong>Bestätigtes Website-Profil</strong>
                  <span>
                    {profile.brand} · {profile.siteTypes.join(" · ")}
                  </span>
                </div>
              </div>
            )}

            <form onSubmit={nextStep}>
              {step === 0 && (
                <div className="review-panel">
                  <div className="review-status">
                    <span className="scan-icon">✓</span>
                    <div>
                      <strong>{scannedPages.length} Inhaltsseiten geprüft</strong>
                      <span>
                        Rechtstexte, Datenschutz, AGB und FAQ wurden dabei
                        ausgelassen.
                      </span>
                    </div>
                  </div>

                  <div className="field full">
                    <FieldLabel help="Diese Einordnung bestimmt, welche Teile des Fragenkatalogs anschließend angezeigt werden. Sie können den Text korrigieren.">
                      So verstehen wir die Website
                    </FieldLabel>
                    <textarea
                      className="summary-input"
                      value={summaryDraft}
                      onChange={(event) => setSummaryDraft(event.target.value)}
                      rows={5}
                      required
                    />
                  </div>

                  <div className="ai-audit-card">
                    <div>
                      <span className="ai-mark">AI</span>
                      <div>
                        <strong>KI-Prüfung des Fragenkatalogs</strong>
                        <p>{auditSummary}</p>
                      </div>
                    </div>
                    <div className="audit-stats">
                      <span>
                        <b>{resolvedQuestions.length}</b> sicher erkannt
                      </span>
                      <span>
                        <b>{openQuestionCount}</b> zu bestätigen oder offen
                      </span>
                    </div>
                  </div>

                  {resolvedQuestions.length > 0 && (
                    <div className="detected-block">
                      <span>Mit hoher Sicherheit bereits beantwortet</span>
                      <div className="resolved-list">
                        {resolvedQuestions.map((item) => (
                          <span key={item.id} title={item.reason}>
                            <b>✓</b> {item.suggestedValue}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {analysisWarnings.length > 0 && (
                    <div className="analysis-warnings">
                      {analysisWarnings.map((warning) => (
                        <span key={warning}>Hinweis: {warning}</span>
                      ))}
                    </div>
                  )}

                  {(profile.operatingPurpose || profile.businessModel) && (
                    <div className="dossier-grid">
                      <div>
                        <span>Zweck und Geschäftsmodell</span>
                        <strong>
                          {profile.operatingPurpose || profile.businessModel}
                        </strong>
                        <p>{profile.businessModel}</p>
                      </div>
                      <div>
                        <span>Typischer Nutzerweg</span>
                        <strong>
                          {profile.userJourney?.join(" → ") ||
                            "Informationen ansehen und Kontakt aufnehmen"}
                        </strong>
                        <p>{profile.legalRelevanceSummary}</p>
                      </div>
                    </div>
                  )}

                  <div className="detected-block">
                    <span>Erkannt</span>
                    <div className="tag-list">
                      {[
                        ...profile.siteTypes,
                        ...profile.offerings,
                        ...profile.audience,
                      ].map((item) => (
                        <span className="detected-tag" key={item}>
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="detected-block">
                    <span>Was trifft auf die Website zu?</span>
                    <div className="signal-grid">
                      {[
                        ["shop", "Warenverkauf"],
                        ["services", "Dienstleistungen"],
                        ["platform", "Plattform oder Software"],
                        ["consumersPossible", "Privatkunden möglich"],
                        ["editorial", "Journalistische Inhalte"],
                        ["audiovisualPrimary", "Videos als Hauptangebot"],
                        ["regulatedProfession", "Reglementierter Beruf"],
                        ["permitRequired", "Besondere Erlaubnis nötig"],
                      ].map(([signal, label]) => {
                        const key =
                          signal as keyof WebsiteAnalysis["signals"];
                        const active = profile.signals[key];
                        return (
                          <button
                            className={`signal-toggle${active ? " active" : ""}`}
                            type="button"
                            key={signal}
                            aria-pressed={active}
                            onClick={() => toggleSignal(key)}
                          >
                            <span>{active ? "✓" : "+"}</span>
                            {label}
                          </button>
                        );
                      })}
                    </div>
                    <small className="signal-help">
                      Tippen Sie auf einen Punkt, wenn unsere Einordnung nicht
                      stimmt.
                    </small>
                  </div>

                  <div className="evidence-list">
                    {profile.reasons.map((reason) => (
                      <span key={reason}>
                        <b aria-hidden="true">✓</b> {reason}
                      </span>
                    ))}
                  </div>

                  <details className="scanned-details">
                    <summary>Geprüfte Seiten anzeigen</summary>
                    <ul>
                      {scannedPages.map((page) => (
                        <li key={page.url}>
                          <span>{page.title}</span>
                          <small>{new URL(page.url).pathname || "/"}</small>
                        </li>
                      ))}
                    </ul>
                  </details>
                </div>
              )}

              {step === 1 && (
                <div className="form-grid">
                  <div className="field full">
                    <FieldLabel assessment={assessmentById.legalForm} help="Gemeint ist die Person oder Organisation, die rechtlich für die Website verantwortlich ist.">
                      Wer betreibt die Website?
                    </FieldLabel>
                    <select
                      value={answers.legalForm}
                      onChange={(event) => update("legalForm", event.target.value)}
                    >
                      {Object.entries(legalForms).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="field full">
                    <FieldLabel assessment={assessmentById.legalName} help="Bitte den echten Namen angeben. Ein Markenname allein reicht nicht aus.">
                      Vollständiger rechtlicher Name
                    </FieldLabel>
                    <input
                      value={answers.legalName}
                      onChange={(event) => update("legalName", event.target.value)}
                      placeholder={
                        answers.legalForm === "sole"
                          ? "z. B. Max Mustermann"
                          : "z. B. Musterfirma GmbH"
                      }
                      required
                    />
                  </div>
                  {needsQuestion("brandName") && (
                  <div className="field full">
                    <FieldLabel assessment={assessmentById.brandName} help="Dieser Name wurde von der KI aus den Website-Inhalten abgeleitet. Sie können ihn ändern.">
                      Geschäfts- oder Markenname
                    </FieldLabel>
                    <input
                      value={answers.brandName}
                      onChange={(event) => update("brandName", event.target.value)}
                    />
                  </div>
                  )}
                  {needsRepresentative && (
                    <>
                      <div className="field">
                        <FieldLabel assessment={assessmentById.representative}>Vertretungsberechtigte Person</FieldLabel>
                        <input
                          value={answers.representative}
                          onChange={(event) =>
                            update("representative", event.target.value)
                          }
                          placeholder="Vor- und Nachname"
                          required
                        />
                      </div>
                      <div className="field">
                        <FieldLabel assessment={assessmentById.representativeRole}>Funktion</FieldLabel>
                        <input
                          value={answers.representativeRole}
                          onChange={(event) =>
                            update("representativeRole", event.target.value)
                          }
                          placeholder="z. B. Geschäftsführung"
                          required
                        />
                      </div>
                    </>
                  )}
                </div>
              )}

              {step === 2 && (
                <div className="form-grid">
                  <div className="field full">
                    <FieldLabel assessment={assessmentById.street} help="An diese Anschrift müssen rechtlich wichtige Briefe zugestellt werden können. Ein Postfach genügt nicht.">
                      Straße und Hausnummer
                    </FieldLabel>
                    <input
                      value={answers.street}
                      onChange={(event) => update("street", event.target.value)}
                      placeholder="Musterstraße 12"
                      required
                    />
                  </div>
                  <div className="field compact">
                    <FieldLabel assessment={assessmentById.zip}>Postleitzahl</FieldLabel>
                    <input
                      value={answers.zip}
                      onChange={(event) => update("zip", event.target.value)}
                      placeholder="12345"
                      required
                    />
                  </div>
                  <div className="field">
                    <FieldLabel assessment={assessmentById.city}>Ort</FieldLabel>
                    <input
                      value={answers.city}
                      onChange={(event) => update("city", event.target.value)}
                      placeholder="Musterstadt"
                      required
                    />
                  </div>
                  <div className="field full">
                    <FieldLabel assessment={assessmentById.country}>Land</FieldLabel>
                    <input
                      value={answers.country}
                      onChange={(event) => update("country", event.target.value)}
                      required
                    />
                  </div>
                  <div className="field full">
                    <FieldLabel assessment={assessmentById.email} help="Verwenden Sie eine Adresse, die regelmäßig gelesen wird.">
                      E-Mail-Adresse
                    </FieldLabel>
                    <input
                      type="email"
                      value={answers.email}
                      onChange={(event) => update("email", event.target.value)}
                      placeholder="kontakt@beispiel.de"
                      required
                    />
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="form-grid">
                  {isRegistered && (
                    <>
                      <div className="field full section-label">
                        <strong>Registereintrag</strong>
                        <span>Diese Angaben brauchen wir wegen Ihrer Rechtsform.</span>
                      </div>
                      <div className="field">
                        <FieldLabel assessment={assessmentById.registerCourt}>Registergericht</FieldLabel>
                        <input
                          value={answers.registerCourt}
                          onChange={(event) =>
                            update("registerCourt", event.target.value)
                          }
                          placeholder="z. B. Amtsgericht Berlin"
                          required
                        />
                      </div>
                      <div className="field">
                        <FieldLabel assessment={assessmentById.registerNumber}>Registernummer</FieldLabel>
                        <input
                          value={answers.registerNumber}
                          onChange={(event) =>
                            update("registerNumber", event.target.value)
                          }
                          placeholder="z. B. HRB 12345"
                          required
                        />
                      </div>
                    </>
                  )}

                  {profile.signals.commercial && needsQuestion("vatStatus") && (
                  <div className="field full">
                    <FieldLabel assessment={assessmentById.vatStatus} help="Nicht gemeint sind Ihre persönliche Steuer-ID oder die normale Steuernummer.">
                      Haben Sie eine Umsatzsteuer-ID?
                    </FieldLabel>
                    <div className="choice-row">
                      <label className={answers.vatStatus === "no" ? "choice selected" : "choice"}>
                        <input
                          type="radio"
                          name="vat"
                          value="no"
                          checked={answers.vatStatus === "no"}
                          onChange={(event) => update("vatStatus", event.target.value)}
                        />
                        Nein
                      </label>
                      <label className={answers.vatStatus === "yes" ? "choice selected" : "choice"}>
                        <input
                          type="radio"
                          name="vat"
                          value="yes"
                          checked={answers.vatStatus === "yes"}
                          onChange={(event) => update("vatStatus", event.target.value)}
                        />
                        Ja
                      </label>
                    </div>
                  </div>
                  )}

                  {profile.signals.commercial && answers.vatStatus === "yes" && needsQuestion("vatId") && (
                    <div className="field full">
                      <FieldLabel assessment={assessmentById.vatId}>Umsatzsteuer-ID</FieldLabel>
                      <input
                        value={answers.vatId}
                        onChange={(event) => update("vatId", event.target.value)}
                        placeholder="DE123456789"
                        required
                      />
                    </div>
                  )}

                  {profile.signals.consumersPossible && needsQuestion("consumers") && (
                  <div className="field full">
                    <FieldLabel assessment={assessmentById.consumers} help="Verbraucher sind Personen, die nicht für ein Unternehmen oder ihre selbstständige Tätigkeit handeln.">
                      Können auch Privatpersonen Verträge abschließen?
                    </FieldLabel>
                    <div className="choice-row">
                      <label className={answers.consumers === "no" ? "choice selected" : "choice"}>
                        <input
                          type="radio"
                          name="consumers"
                          value="no"
                          checked={answers.consumers === "no"}
                          onChange={(event) => update("consumers", event.target.value)}
                        />
                        Nein, nur Unternehmen
                      </label>
                      <label className={answers.consumers === "yes" ? "choice selected" : "choice"}>
                        <input
                          type="radio"
                          name="consumers"
                          value="yes"
                          checked={answers.consumers === "yes"}
                          onChange={(event) => update("consumers", event.target.value)}
                        />
                        Ja
                      </label>
                    </div>
                  </div>
                  )}

                  {profile.signals.consumersPossible &&
                    answers.consumers === "yes" &&
                    (needsQuestion("employeeCount") || needsQuestion("dispute")) && (
                    <>
                      {needsQuestion("employeeCount") && (
                      <div className="field">
                        <FieldLabel assessment={assessmentById.employeeCount}>Wie viele Beschäftigte gibt es?</FieldLabel>
                        <select
                          value={answers.employeeCount}
                          onChange={(event) =>
                            update("employeeCount", event.target.value)
                          }
                        >
                          <option value="0-10">0 bis 10</option>
                          <option value="more">Mehr als 10</option>
                        </select>
                      </div>
                      )}
                      {needsQuestion("dispute") && (
                      <div className="field">
                        <FieldLabel assessment={assessmentById.dispute}>Teilnahme an einer Schlichtung?</FieldLabel>
                        <select
                          value={answers.dispute}
                          onChange={(event) => update("dispute", event.target.value)}
                        >
                          <option value="no">Nein</option>
                          <option value="yes">Ja</option>
                        </select>
                      </div>
                      )}
                    </>
                  )}

                  {profile.signals.editorial && needsQuestion("editorial") && (
                    <div className="field full">
                      <FieldLabel assessment={assessmentById.editorial} help="Ein gewöhnlicher Unternehmensblog ist nicht automatisch journalistisch-redaktionell.">
                        Gibt es journalistische Inhalte?
                      </FieldLabel>
                      <select
                        value={answers.editorial}
                        onChange={(event) => update("editorial", event.target.value)}
                      >
                        <option value="no">Nein, nur Unternehmensinhalte</option>
                        <option value="yes">Ja</option>
                      </select>
                    </div>
                  )}

                  {profile.signals.editorial && answers.editorial === "yes" && needsQuestion("editorName") && (
                    <div className="field full">
                      <FieldLabel assessment={assessmentById.editorName}>Redaktionell verantwortliche Person</FieldLabel>
                      <input
                        value={answers.editorName}
                        onChange={(event) => update("editorName", event.target.value)}
                        placeholder="Vor- und Nachname"
                        required
                      />
                    </div>
                  )}

                  {profile.signals.regulatedProfession && (
                    <>
                      <div className="field full section-label">
                        <strong>Reglementierter Beruf erkannt</strong>
                        <span>
                          Die Website nennt einen Beruf mit besonderen
                          Pflichtangaben.
                        </span>
                      </div>
                      {needsQuestion("regulatedStatus") && (
                      <div className="field full">
                        <FieldLabel assessment={assessmentById.regulatedStatus}>
                          Wird dieser Beruf tatsächlich angeboten?
                        </FieldLabel>
                        <select
                          value={answers.regulatedStatus}
                          onChange={(event) =>
                            update("regulatedStatus", event.target.value)
                          }
                        >
                          <option value="yes">Ja</option>
                          <option value="no">Nein</option>
                        </select>
                      </div>
                      )}
                      {answers.regulatedStatus === "yes" && (
                        <>
                          {needsQuestion("profession") && (
                          <div className="field">
                            <FieldLabel assessment={assessmentById.profession}>Gesetzliche Berufsbezeichnung</FieldLabel>
                            <input
                              value={answers.profession}
                              onChange={(event) =>
                                update("profession", event.target.value)
                              }
                              placeholder="z. B. Rechtsanwalt"
                              required
                            />
                          </div>
                          )}
                          {needsQuestion("awardCountry") && (
                          <div className="field">
                            <FieldLabel assessment={assessmentById.awardCountry}>Verleihungsstaat</FieldLabel>
                            <input
                              value={answers.awardCountry}
                              onChange={(event) =>
                                update("awardCountry", event.target.value)
                              }
                              required
                            />
                          </div>
                          )}
                          {needsQuestion("chamber") && (
                          <div className="field full">
                            <FieldLabel assessment={assessmentById.chamber}>Zuständige Kammer</FieldLabel>
                            <input
                              value={answers.chamber}
                              onChange={(event) =>
                                update("chamber", event.target.value)
                              }
                              placeholder="Vollständiger Name der Kammer"
                            />
                          </div>
                          )}
                        </>
                      )}
                    </>
                  )}

                  {profile.signals.permitRequired && (
                    <>
                      <div className="field full section-label">
                        <strong>Erlaubnispflichtige Tätigkeit erkannt</strong>
                        <span>
                          Für diese Tätigkeit kann eine Aufsichtsbehörde genannt
                          werden müssen.
                        </span>
                      </div>
                      {needsQuestion("permitStatus") && (
                      <div className="field">
                        <FieldLabel assessment={assessmentById.permitStatus}>Ist eine Erlaubnis erforderlich?</FieldLabel>
                        <select
                          value={answers.permitStatus}
                          onChange={(event) =>
                            update("permitStatus", event.target.value)
                          }
                        >
                          <option value="yes">Ja</option>
                          <option value="no">Nein</option>
                        </select>
                      </div>
                      )}
                      {answers.permitStatus === "yes" && needsQuestion("authority") && (
                        <div className="field">
                          <FieldLabel assessment={assessmentById.authority}>Zuständige Behörde</FieldLabel>
                          <input
                            value={answers.authority}
                            onChange={(event) =>
                              update("authority", event.target.value)
                            }
                            placeholder="Name und Anschrift"
                            required
                          />
                        </div>
                      )}
                    </>
                  )}

                  {profile.signals.audiovisualPrimary && (
                    <>
                      <div className="field full section-label">
                        <strong>Videos als Hauptangebot erkannt</strong>
                        <span>
                          Wir fragen deshalb nach dem Modul für audiovisuelle
                          Mediendienste.
                        </span>
                      </div>
                      {needsQuestion("audiovisualStatus") && (
                      <div className="field">
                        <FieldLabel assessment={assessmentById.audiovisualStatus}>
                          Trifft der Anbieter die redaktionellen Entscheidungen?
                        </FieldLabel>
                        <select
                          value={answers.audiovisualStatus}
                          onChange={(event) =>
                            update("audiovisualStatus", event.target.value)
                          }
                        >
                          <option value="yes">Ja</option>
                          <option value="no">Nein</option>
                        </select>
                      </div>
                      )}
                      {answers.audiovisualStatus === "yes" && needsQuestion("mediaAuthority") && (
                        <div className="field">
                          <FieldLabel assessment={assessmentById.mediaAuthority}>Zuständige Medienbehörde</FieldLabel>
                          <input
                            value={answers.mediaAuthority}
                            onChange={(event) =>
                              update("mediaAuthority", event.target.value)
                            }
                            placeholder="Name der Behörde"
                            required
                          />
                        </div>
                      )}
                    </>
                  )}

                  {!isRegistered &&
                    !profile.signals.commercial &&
                    !profile.signals.consumersPossible &&
                    !profile.signals.editorial &&
                    !profile.signals.regulatedProfession &&
                    !profile.signals.permitRequired &&
                    !profile.signals.audiovisualPrimary && (
                      <div className="field full quiet-result">
                        <span className="scan-icon">✓</span>
                        <div>
                          <strong>Keine weiteren Fragen nötig</strong>
                          <span>
                            Für dieses Website-Profil wurden keine zusätzlichen
                            Module aktiviert.
                          </span>
                        </div>
                      </div>
                    )}
                </div>
              )}

              <div className="modal-actions">
                {step > 0 ? (
                  <button
                    className="secondary-button"
                    type="button"
                    onClick={() => setStep((current) => current - 1)}
                  >
                    Zurück
                  </button>
                ) : (
                  <span />
                )}
                <button className="primary-button" type="submit">
                  {step === 0
                    ? "Ja, so passt es"
                    : step === 3
                      ? "Impressum erstellen"
                      : "Weiter"}
                  <span aria-hidden="true">→</span>
                </button>
              </div>
            </form>
            <div className="progress">
              <span style={{ width: `${((step + 1) / 4) * 100}%` }} />
            </div>
          </section>
        </div>
      )}

      {resultOpen && (
        <div className="modal-backdrop" role="presentation">
          <section
            className="result-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="result-title"
          >
            <div className="result-header">
              <span className="success-mark">✓</span>
              <div>
                <span className="modal-kicker">Fertig</span>
                <h2 id="result-title">Ihr Impressum ist bereit.</h2>
                <p>Prüfen, kopieren und auf Ihrer Website einfügen.</p>
              </div>
              <button
                className="close-button"
                type="button"
                onClick={() => setResultOpen(false)}
                aria-label="Fenster schließen"
              >
                ×
              </button>
            </div>

            <div className="result-body">
              <div className="document">
                <div className="document-top">
                  <span>Vorschau</span>
                  <button type="button" onClick={copyImprint}>
                    {copied ? "Kopiert ✓" : "Text kopieren"}
                  </button>
                </div>
                <pre>{imprint}</pre>
              </div>
              <aside className="result-aside">
                <strong>Vor dem Veröffentlichen</strong>
                <p>
                  Prüfen Sie Namen, Anschrift und Registerdaten noch einmal auf
                  Tippfehler.
                </p>
                <div className="aside-note">
                  Diese Demo erstellt einen automatisierten Entwurf und ersetzt
                  keine individuelle Rechtsberatung.
                </div>
              </aside>
            </div>

            <div className="result-actions">
              <button
                className="secondary-button"
                type="button"
                onClick={() => {
                  setResultOpen(false);
                  setStep(1);
                  setDialogOpen(true);
                }}
              >
                Angaben bearbeiten
              </button>
              <button className="primary-button" type="button" onClick={copyImprint}>
                {copied ? "In Zwischenablage kopiert" : "Impressum kopieren"}
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
