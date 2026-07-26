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
}: {
  children: React.ReactNode;
  help?: string;
}) {
  return (
    <label className="field-label">
      <span>
        {children} {help && <Info text={help} />}
      </span>
    </label>
  );
}

export default function Home() {
  const [url, setUrl] = useState("");
  const [urlError, setUrlError] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [resultOpen, setResultOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [profile, setProfile] = useState({
    brand: "Ihre Website",
    type: "Dienstleistung",
    editorialSignal: false,
  });
  const [answers, setAnswers] = useState(initialAnswers);

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

  function analyzeWebsite(event: FormEvent) {
    event.preventDefault();
    setUrlError("");
    let parsed: URL;

    try {
      parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
    } catch {
      setUrlError("Bitte geben Sie eine gültige Webadresse ein.");
      return;
    }

    const host = parsed.hostname.replace(/^www\./, "");
    const name = host.split(".")[0];
    const label = name.charAt(0).toUpperCase() + name.slice(1);
    const combined = `${host}${parsed.pathname}`.toLowerCase();
    const editorialSignal = /blog|magazin|news|journal/.test(combined);
    const type = /shop|store|laden/.test(combined)
      ? "Onlineshop"
      : /blog|magazin|news|journal/.test(combined)
        ? "Blog oder Magazin"
        : "Digitale Dienstleistung";

    setAnalyzing(true);
    window.setTimeout(() => {
      setProfile({ brand: label, type, editorialSignal });
      setAnswers({ ...initialAnswers, brandName: label });
      setStep(1);
      setAnalyzing(false);
      setDialogOpen(true);
    }, 1100);
  }

  function nextStep(event: FormEvent) {
    event.preventDefault();
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
              {analyzing ? "Website wird geprüft …" : "Website prüfen"}
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
                <span className="modal-kicker">Schritt {step} von 3</span>
                <h2 id="question-title">
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

            <div className="analysis-note">
              <span className="scan-icon">✓</span>
              <div>
                <strong>Auf der Website erkannt</strong>
                <span>
                  {profile.brand} · {profile.type} · geschäftliches Angebot
                </span>
              </div>
            </div>

            <form onSubmit={nextStep}>
              {step === 1 && (
                <div className="form-grid">
                  <div className="field full">
                    <FieldLabel help="Gemeint ist die Person oder Organisation, die rechtlich für die Website verantwortlich ist.">
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
                    <FieldLabel help="Bitte den echten Namen angeben. Ein Markenname allein reicht nicht aus.">
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
                  <div className="field full">
                    <FieldLabel help="Dieser Name wurde aus der Webadresse abgeleitet. Sie können ihn ändern.">
                      Geschäfts- oder Markenname
                    </FieldLabel>
                    <input
                      value={answers.brandName}
                      onChange={(event) => update("brandName", event.target.value)}
                    />
                  </div>
                  {needsRepresentative && (
                    <>
                      <div className="field">
                        <FieldLabel>Vertretungsberechtigte Person</FieldLabel>
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
                        <FieldLabel>Funktion</FieldLabel>
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
                    <FieldLabel help="An diese Anschrift müssen rechtlich wichtige Briefe zugestellt werden können. Ein Postfach genügt nicht.">
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
                    <FieldLabel>Postleitzahl</FieldLabel>
                    <input
                      value={answers.zip}
                      onChange={(event) => update("zip", event.target.value)}
                      placeholder="12345"
                      required
                    />
                  </div>
                  <div className="field">
                    <FieldLabel>Ort</FieldLabel>
                    <input
                      value={answers.city}
                      onChange={(event) => update("city", event.target.value)}
                      placeholder="Musterstadt"
                      required
                    />
                  </div>
                  <div className="field full">
                    <FieldLabel>Land</FieldLabel>
                    <input
                      value={answers.country}
                      onChange={(event) => update("country", event.target.value)}
                      required
                    />
                  </div>
                  <div className="field full">
                    <FieldLabel help="Verwenden Sie eine Adresse, die regelmäßig gelesen wird.">
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
                        <FieldLabel>Registergericht</FieldLabel>
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
                        <FieldLabel>Registernummer</FieldLabel>
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

                  <div className="field full">
                    <FieldLabel help="Nicht gemeint sind Ihre persönliche Steuer-ID oder die normale Steuernummer.">
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

                  {answers.vatStatus === "yes" && (
                    <div className="field full">
                      <FieldLabel>Umsatzsteuer-ID</FieldLabel>
                      <input
                        value={answers.vatId}
                        onChange={(event) => update("vatId", event.target.value)}
                        placeholder="DE123456789"
                        required
                      />
                    </div>
                  )}

                  <div className="field full">
                    <FieldLabel help="Verbraucher sind Personen, die nicht für ein Unternehmen oder ihre selbstständige Tätigkeit handeln.">
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

                  {answers.consumers === "yes" && (
                    <>
                      <div className="field">
                        <FieldLabel>Wie viele Beschäftigte gibt es?</FieldLabel>
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
                      <div className="field">
                        <FieldLabel>Teilnahme an einer Schlichtung?</FieldLabel>
                        <select
                          value={answers.dispute}
                          onChange={(event) => update("dispute", event.target.value)}
                        >
                          <option value="no">Nein</option>
                          <option value="yes">Ja</option>
                        </select>
                      </div>
                    </>
                  )}

                  {profile.editorialSignal && (
                    <div className="field full">
                      <FieldLabel help="Gemeint sind regelmäßig veröffentlichte Nachrichten, Berichte oder gesellschaftliche Kommentare.">
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

                  {profile.editorialSignal && answers.editorial === "yes" && (
                    <div className="field full">
                      <FieldLabel>Redaktionell verantwortliche Person</FieldLabel>
                      <input
                        value={answers.editorName}
                        onChange={(event) => update("editorName", event.target.value)}
                        placeholder="Vor- und Nachname"
                        required
                      />
                    </div>
                  )}
                </div>
              )}

              <div className="modal-actions">
                {step > 1 ? (
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
                  {step === 3 ? "Impressum erstellen" : "Weiter"}
                  <span aria-hidden="true">→</span>
                </button>
              </div>
            </form>
            <div className="progress">
              <span style={{ width: `${(step / 3) * 100}%` }} />
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
