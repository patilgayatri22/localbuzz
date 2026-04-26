/**
 * LocalBuzz — AI-assisted collaboration campaign workflow.
 * Automates prep; human approval gates for sends, deals, deliverables, payment.
 */

export const STATUS = {
  DRAFT: "draft",
  SENT_TO_INFLUENCER: "sent_to_influencer",
  INFLUENCER_INTERESTED: "influencer_interested",
  INFLUENCER_COUNTER: "influencer_counter",
  INFLUENCER_REJECTED: "influencer_rejected",
  NEED_DETAILS: "need_details",
  PLAN_PENDING_APPROVAL: "plan_pending_approval",
  ACTIVE: "active",
  CONTENT_SUBMITTED: "content_submitted",
  PENDING_DELIVERABLE_APPROVAL: "pending_deliverable_approval",
  COMPLETED: "completed",
};

export const HUMAN_GATE = {
  SEND_REQUEST: "send_collaboration_request",
  INFLUENCER_RESPONSE: "influencer_response",
  APPROVE_PLAN_BUSINESS: "approve_plan_business",
  APPROVE_PLAN_INFLUENCER: "approve_plan_influencer",
  APPROVE_DELIVERABLE: "approve_deliverable",
  MARK_PAYMENT: "mark_payment_done",
};

export function canBusinessSendRequest(c) {
  return c.status === STATUS.DRAFT && Boolean(c.influencerId) && Boolean(c.brief);
}

export function canInfluencerRespond(c) {
  return c.status === STATUS.SENT_TO_INFLUENCER;
}

export function bothPlanApprovals(approvals) {
  return Boolean(approvals?.businessPlan) && Boolean(approvals?.influencerPlan);
}

function pushTimeline(timeline, label, actor) {
  const at = new Date().toISOString();
  return [...(timeline || []), { at, label, actor }];
}

export function transition(campaign, event, payload = {}) {
  const updatedAt = new Date().toISOString();
  const c = { ...campaign, updatedAt };

  switch (event) {
    case HUMAN_GATE.SEND_REQUEST: {
      if (!canBusinessSendRequest(c)) return { ok: false, error: "Cannot send request in current state." };
      const next = {
        ...c,
        status: STATUS.SENT_TO_INFLUENCER,
        timeline: pushTimeline(c.timeline, "Collaboration request sent", "business"),
      };
      return { ok: true, campaign: next };
    }

    case HUMAN_GATE.INFLUENCER_RESPONSE: {
      if (!canInfluencerRespond(c)) return { ok: false, error: "Influencer cannot respond now." };
      const choice = payload.choice;
      if (choice === "interested") {
        return {
          ok: true,
          campaign: {
            ...c,
            status: STATUS.INFLUENCER_INTERESTED,
            influencerNote: payload.note || "",
            timeline: pushTimeline(c.timeline, "Influencer: Interested", "influencer"),
          },
        };
      }
      if (choice === "counter") {
        return {
          ok: true,
          campaign: {
            ...c,
            status: STATUS.INFLUENCER_COUNTER,
            counterOffer: payload.counterOffer || "",
            timeline: pushTimeline(c.timeline, "Influencer: Counter offer", "influencer"),
          },
        };
      }
      if (choice === "reject") {
        return {
          ok: true,
          campaign: {
            ...c,
            status: STATUS.INFLUENCER_REJECTED,
            timeline: pushTimeline(c.timeline, "Influencer: Rejected", "influencer"),
          },
        };
      }
      if (choice === "more_details") {
        return {
          ok: true,
          campaign: {
            ...c,
            status: STATUS.NEED_DETAILS,
            influencerQuestion: payload.question || "",
            timeline: pushTimeline(c.timeline, "Influencer: Asked for more details", "influencer"),
          },
        };
      }
      return { ok: false, error: "Unknown influencer choice." };
    }

    case "ai_plan_attached": {
      if (c.status !== STATUS.INFLUENCER_INTERESTED && c.status !== STATUS.INFLUENCER_COUNTER) {
        return { ok: false, error: "Attach a plan only after the influencer is interested (or after a counter-offer round)." };
      }
      const next = {
        ...c,
        suggestedPlan: payload.plan,
        status: STATUS.PLAN_PENDING_APPROVAL,
        approvals: { businessPlan: false, influencerPlan: false },
        timeline: pushTimeline(c.timeline, "AI suggested campaign plan — awaiting approvals", "system"),
      };
      return { ok: true, campaign: next };
    }

    case HUMAN_GATE.APPROVE_PLAN_BUSINESS: {
      if (c.status !== STATUS.PLAN_PENDING_APPROVAL) return { ok: false, error: "Plan is not pending approval." };
      const approvals = { ...c.approvals, businessPlan: true };
      let next = {
        ...c,
        approvals,
        timeline: pushTimeline(c.timeline, "Business approved plan", "business"),
      };
      if (bothPlanApprovals(approvals)) {
        next = {
          ...next,
          status: STATUS.ACTIVE,
          timeline: pushTimeline(next.timeline, "Both approved — campaign active", "system"),
        };
      }
      return { ok: true, campaign: next };
    }

    case HUMAN_GATE.APPROVE_PLAN_INFLUENCER: {
      if (c.status !== STATUS.PLAN_PENDING_APPROVAL) return { ok: false, error: "Plan is not pending approval." };
      const approvals = { ...c.approvals, influencerPlan: true };
      let next = {
        ...c,
        approvals,
        timeline: pushTimeline(c.timeline, "Influencer approved plan", "influencer"),
      };
      if (bothPlanApprovals(approvals)) {
        next = {
          ...next,
          status: STATUS.ACTIVE,
          timeline: pushTimeline(next.timeline, "Both approved — campaign active", "system"),
        };
      }
      return { ok: true, campaign: next };
    }

    case "influencer_submit_content": {
      if (c.status !== STATUS.ACTIVE) return { ok: false, error: "Campaign must be active to submit content." };
      return {
        ok: true,
        campaign: {
          ...c,
          submittedContent: payload.url || payload.text || "",
          status: STATUS.CONTENT_SUBMITTED,
          timeline: pushTimeline(c.timeline, "Influencer submitted content", "influencer"),
        },
      };
    }

    case HUMAN_GATE.APPROVE_DELIVERABLE: {
      if (c.status !== STATUS.CONTENT_SUBMITTED && c.status !== STATUS.PENDING_DELIVERABLE_APPROVAL) {
        return { ok: false, error: "No deliverable pending approval." };
      }
      return {
        ok: true,
        campaign: {
          ...c,
          status: STATUS.COMPLETED,
          resultsSummary: payload.summary || c.resultsSummary || "",
          timeline: pushTimeline(c.timeline, "Business approved deliverables — completed", "business"),
        },
      };
    }

    case "business_request_revision": {
      return {
        ok: true,
        campaign: {
          ...c,
          status: STATUS.PENDING_DELIVERABLE_APPROVAL,
          revisionNote: payload.note || "",
          timeline: pushTimeline(c.timeline, "Business requested revision", "business"),
        },
      };
    }

    default:
      return { ok: false, error: `Unknown event: ${event}` };
  }
}

export function defaultDueDate(isoStart) {
  const d = new Date(isoStart || Date.now());
  d.setDate(d.getDate() + 14);
  return d.toISOString();
}
