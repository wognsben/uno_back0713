import type { InfoDocumentId } from "../infoDocuments";
import { INFO_DOCUMENT_ITEMS } from "../infoDocuments";
import navigateToInfo from "./infoNavigation";

export default function InfoDocumentNav({
  active,
}: {
  active: InfoDocumentId;
}) {
  return (
    <nav className="uno-info-doc-nav" aria-label="INFO 문서 이동">
      {INFO_DOCUMENT_ITEMS.map((item) => {
        const isActive = active === item.id;

        return (
          <button
            key={item.id}
            type="button"
            aria-current={isActive ? "page" : undefined}
            className={`uno-info-doc-button ${isActive ? "is-active" : ""}`}
            onClick={() => navigateToInfo(item.path)}
          >
            <span className="uno-info-doc-number">{item.number}</span>
            <span className="uno-info-doc-text">
              <span className="uno-info-doc-label">{item.label}</span>
              <strong className="uno-info-doc-title">{item.title}</strong>
            </span>
            <span className="uno-info-doc-arrow" aria-hidden="true">
              →
            </span>
          </button>
        );
      })}
    </nav>
  );
}