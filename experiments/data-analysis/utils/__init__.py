import requests
import json

def get_transaction_details(intent_hash):
    """
    Fetch transaction details from the Radix network.
    
    Args:
        intent_hash (str): The transaction intent hash to query
        
    Returns:
        requests.Response: The response object from the API request
    """
    # Define the endpoint URL
    url = 'https://mainnet.radixdlt.com/transaction/committed-details'

    # Define the headers
    headers = {
        'accept': 'application/json',
        'Content-Type': 'application/json'
    }

    # Define the payload data
    payload = {
        "intent_hash": intent_hash,
        "opt_ins": {
            "raw_hex": True,
            "receipt_state_changes": True,
            "receipt_fee_summary": True,
            "manifest_instructions": True,
            "receipt_fee_source": True,
            "receipt_fee_destination": True,
            "receipt_costing_parameters": True,
            "receipt_events": True,
            "receipt_output": True,
            "affected_global_entities": True,
            "balance_changes": True
        }
    }

    # Make the POST request
    return requests.post(url, headers=headers, data=json.dumps(payload))


def get_transaction_stream(state_version):
    """
    Get transaction stream data from the Radix API.
    
    Args:
        state_version (int): The state version to query
        
    Returns:
        requests.Response: The response object from the API request
    """
    # Define the endpoint URL
    url = 'https://mainnet.radixdlt.com/stream/transactions'
    
    # Define the headers
    headers = {
        'accept': 'application/json',
        'Content-Type': 'application/json'
    }
    
    # Define the payload data
    payload = {
        "at_ledger_state": {
            "state_version": state_version
        },
        "opt_ins": {
            "detailed_events": True
        },
        "transaction_status_filter": "Success"
        
    }
    
    # Make the POST request
    return requests.post(url, headers=headers, data=json.dumps(payload))
