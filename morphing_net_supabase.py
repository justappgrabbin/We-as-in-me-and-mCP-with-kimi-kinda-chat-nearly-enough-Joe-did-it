# ============================================================================
# SUPABASE INTEGRATION
# ============================================================================

import requests
import json
from typing import Optional, Dict, Any

SUPABASE_URL = 'https://leisphnjslcuepflefri.supabase.co'
SUPABASE_ANON_KEY = 'sb_publishable_r875ycY951IHyew2SwXEmg_qMOgv9AW'

class SupabaseClient:
    def __init__(self, url: str = SUPABASE_URL, key: str = SUPABASE_ANON_KEY):
        self.url = url
        self.key = key
        self.headers = {
            'apikey': key,
            'Authorization': f'Bearer {key}',
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
        }

    def save_artifact(self, artifact_id, artifact_type, source_name, source_hash,
                      dissolved, analysis, synthesis, artifact):
        data = {
            'id': artifact_id,
            'type': artifact_type,
            'source_name': source_name,
            'source_hash': source_hash,
            'dissolved': json.dumps(dissolved),
            'analysis': json.dumps(analysis),
            'synthesis': json.dumps(synthesis),
            'python_code': artifact.get('python'),
            'html_code': artifact.get('html'),
            'js_code': artifact.get('js'),
            'css_code': artifact.get('css'),
            'json_config': artifact.get('json_config'),
            'metadata': json.dumps(artifact.get('metadata', {})),
            'created_at': datetime.now().isoformat()
        }
        try:
            resp = requests.post(
                f'{self.url}/rest/v1/artifacts',
                headers=self.headers,
                json=data
            )
            if resp.status_code in [200, 201]:
                return f'artifacts/{artifact_id}'
            else:
                print(f'Supabase save error: {resp.status_code}')
                return None
        except Exception as e:
            print(f'Supabase connection error: {e}')
            return None

    def get_artifact(self, artifact_id):
        try:
            resp = requests.get(
                f'{self.url}/rest/v1/artifacts?id=eq.{artifact_id}',
                headers=self.headers
            )
            if resp.status_code == 200:
                data = resp.json()
                return data[0] if data else None
            return None
        except Exception as e:
            print(f'Supabase fetch error: {e}')
            return None

    def list_artifacts(self, limit=50):
        try:
            resp = requests.get(
                f'{self.url}/rest/v1/artifacts?order=created_at.desc&limit={limit}',
                headers=self.headers
            )
            if resp.status_code == 200:
                return resp.json()
            return []
        except Exception as e:
            print(f'Supabase list error: {e}')
            return []

    def save_morph_memory(self, memory_entry):
        try:
            resp = requests.post(
                f'{self.url}/rest/v1/morph_memory',
                headers=self.headers,
                json={
                    'timestamp': memory_entry.get('timestamp'),
                    'start_gate': memory_entry.get('start_gate'),
                    'end_gate': memory_entry.get('end_gate'),
                    'layers': json.dumps(memory_entry.get('layers', [])),
                    'families': json.dumps(memory_entry.get('families', [])),
                    'emergent_count': memory_entry.get('emergent_count'),
                    'user_kept': memory_entry.get('user_kept'),
                    'weight_adjustment': memory_entry.get('weight_adjustment')
                }
            )
            return resp.status_code in [200, 201]
        except Exception as e:
            print(f'Supabase memory save error: {e}')
            return False