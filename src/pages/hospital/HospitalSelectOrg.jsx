import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { Shield, Building2, ArrowRight, Loader } from 'lucide-react';
import { auth, db } from '../../firebase/config';

export default function HospitalSelectOrg() {
  const navigate = useNavigate();
  const [orgs, setOrgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrgs = async () => {
      if (!auth.currentUser) {
        navigate('/hospital/login');
        return;
      }
      try {
        const userDocRef = doc(db, 'users', auth.currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const orgIds = userData.associatedOrgs || [];
          
          if (orgIds.length === 0) {
            navigate('/hospital/onboarding');
            return;
          }
          
          const orgPromises = orgIds.map(id => getDoc(doc(db, 'hospital_organizations', id)));
          const orgDocs = await Promise.all(orgPromises);
          
          const fetchedOrgs = orgDocs
            .filter(d => d.exists())
            .map(d => ({ id: d.id, ...d.data() }));
          
          setOrgs(fetchedOrgs);
        } else {
          setError('User profile details not found.');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrgs();
  }, [navigate]);

  const selectHospital = (orgId) => {
    localStorage.setItem('hc_erp_org_id', orgId);
    navigate('/hospital/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#F7F4EB] text-[#111111] font-sans flex items-center justify-center p-6">
      <div className="w-full max-w-md border border-[#ECECEC] rounded-[12px] p-8 bg-white shadow-sm space-y-6">
        <div className="text-center flex flex-col items-center">
          <div className="w-10 h-10 rounded-[12px] bg-[#111111] flex items-center justify-center text-white mb-4">
            <Building2 className="w-5 h-5" />
          </div>
          <h2 className="font-sans text-xl font-bold uppercase tracking-wider text-[#111111]">
            Select Organization
          </h2>
          <p className="text-xs text-[#666666] mt-1">
            Choose a hospital workspace to launch the ERP.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader className="w-6 h-6 animate-spin text-[#666666]" />
          </div>
        ) : error ? (
          <div className="p-3.5 bg-red-50 text-[#DC2626] border border-red-200/50 rounded-[12px] text-xs text-center font-bold">
            {error}
          </div>
        ) : orgs.length === 0 ? (
          <div className="text-center py-6 space-y-4">
            <p className="text-xs text-[#666666]">No hospital workspaces linked to your profile.</p>
            <button
              onClick={() => navigate('/hospital/onboarding')}
              className="w-full py-3 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold uppercase rounded-[12px]"
            >
              Setup Onboarding Profile
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {orgs.map((org) => (
              <button
                key={org.id}
                onClick={() => selectHospital(org.id)}
                className="w-full p-4 border border-[#ECECEC] rounded-[12px] text-left hover:border-[#111111] hover:bg-[#F7F4EB]/30 transition-all flex justify-between items-center"
              >
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#111111]">{org.name}</h3>
                  <p className="text-[10px] text-[#666666] font-mono mt-1">{org.city}, {org.state} | {org.beds} Beds</p>
                </div>
                <ArrowRight className="w-4 h-4 text-[#666666]" />
              </button>
            ))}
          </div>
        )}

        <div className="text-center pt-2">
          <button
            onClick={() => {
              auth.signOut();
              navigate('/hospital/login');
            }}
            className="text-xs text-[#DC2626] font-bold hover:underline"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
