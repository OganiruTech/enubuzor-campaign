// backend/routes/chat.js

import express from 'express';

const router = express.Router();

const CANDIDATE    = 'Ogbuefi Nicholas Enubuzor';
const PARTY        = 'NDC (National Democratic Congress)';
const CONSTITUENCY = 'Ukwuani/Ndokwa Federal Constituency, Delta State';
const SLOGAN       = 'Service to the People';

const getMockResponse = (message) => {
  const m = message.toLowerCase();

  if (m.includes('volunteer') || m.includes('join') || m.includes('sign up')) {
    return `Great to hear you want to get involved! 🎉 You can join the movement by visiting our **Volunteer** page. We have roles for everyone — polling unit agents, ward mobilizers, campaign ambassadors, and general volunteers. Every hand counts in building a stronger Ukwuani/Ndokwa Federal Constituency!`;
  }

  if (m.includes('event') || m.includes('rally') || m.includes('meeting') || m.includes('town hall')) {
    return `We have exciting events coming up across the constituency! 📅 Visit our **Events** page to see all upcoming town halls, community visits, and campaign rallies. You can RSVP directly on the site to secure your spot.`;
  }

  if (m.includes('donat') || m.includes('support') || m.includes('money') || m.includes('fund')) {
    return `Your financial support makes a huge difference! 💙 Every contribution — big or small — helps us reach more communities. Visit our **Support** page to make a donation. We accept bank transfers, online payments, and cash. All funds go directly to campaign activities.`;
  }

  if (m.includes('issue') || m.includes('problem') || m.includes('road') || m.includes('water') || m.includes('school') || m.includes('hospital') || m.includes('electricity')) {
    return `${CANDIDATE} is committed to addressing community problems head-on. 🚨 Please report your community issue on our **Community Issues** page. Every issue gets reviewed by the campaign team, and we will champion your cause at the assembly level.`;
  }

  if (m.includes('promise') || m.includes('policy') || m.includes('plan') || m.includes('agenda')) {
    return `${CANDIDATE}'s key campaign promises include:\n\n1. **Quality Representation** — Your voice at the National Assembly\n2. **Infrastructure** — Roads, bridges, and community facilities\n3. **Education & Youth** — Scholarships, skills training, and job creation\n4. **Healthcare** — Affordable clinics in every ward\n5. **Security** — Community-driven safety initiatives\n6. **Transparency** — Regular public reports on all legislative activities`;
  }

  if (m.includes('who') || m.includes('candidate') || m.includes('enubuzor') || m.includes('nicholas') || m.includes('ogbuefi')) {
    return `**${CANDIDATE}** is the ${PARTY} aspirant for House of Representatives, ${CONSTITUENCY}. He is running on the platform of *"${SLOGAN}"* — committed to bringing real, people-centered representation to the constituency for the 2027 elections.`;
  }

  if (m.includes('ndc') || m.includes('party') || m.includes('national democratic')) {
    return `The **National Democratic Congress (NDC)** is a progressive political party in Nigeria dedicated to democratic values, good governance, and service to the people. ${CANDIDATE} proudly flies the NDC flag for Ukwuani/Ndokwa Federal Constituency under the slogan *"${SLOGAN}"*.`;
  }

  if (m.includes('ward') || m.includes('community') || m.includes('ukwuani') || m.includes('ndokwa')) {
    return `The Ukwuani/Ndokwa Federal Constituency covers several wards including Obiaruku, Umukwata, Umuaja, Ebedei, Amai, Obinomba, Umutu, and more. ${CANDIDATE} is committed to visiting every ward and ensuring equal development for all communities.`;
  }

  if (m.includes('vote') || m.includes('election') || m.includes('2027')) {
    return `The 2027 general elections are a critical opportunity to elect a representative who truly cares about Ukwuani/Ndokwa Federal Constituency. Vote **${CANDIDATE}** — NDC — for House of Representatives. Make sure you have your PVC (Permanent Voter Card) ready. Your vote is your power! 🗳️`;
  }

  if (m.includes('contact') || m.includes('reach') || m.includes('phone') || m.includes('email')) {
    return `You can reach the campaign team through this website. Use the **Community Issues** page to report problems, the **Events** page to attend our programmes, or the **Volunteer** page to join us. Our team will get back to you promptly.`;
  }

  if (m.includes('slogan') || m.includes('motto') || m.includes('service')) {
    return `The NDC campaign slogan is **"${SLOGAN}"** — a commitment that every action taken by ${CANDIDATE} in office will be in direct service to the people of Ukwuani/Ndokwa Federal Constituency.`;
  }

  return `Thank you for your message! 🇳🇬 I'm the official NDC Campaign Assistant for **${CANDIDATE}**. I can help you with:\n\n- Learning about our aspirant and campaign promises\n- Finding upcoming events\n- Reporting community issues\n- Joining as a volunteer\n- Making a donation\n\nWhat would you like to know?`;
};

// POST /api/chat
router.post('/', async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Simulate slight delay
    await new Promise(resolve => setTimeout(resolve, 400 + Math.random() * 300));

    const reply = getMockResponse(message);
    res.json({ reply });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

export default router;