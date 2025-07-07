'use client';

import { useState } from 'react';
import { cn } from '~/lib/utils';
import { Button } from '~/components/ui/button';
import { ChevronDown, ChevronRight, AlertTriangle } from 'lucide-react';
interface AccountBalanceItem {
  activityId: string;
  usdValue: string;
  metadata?: Record<string, unknown>;
}

interface AccountBalance {
  accountAddress: string;
  timestamp: Date;
  data: AccountBalanceItem[];
}

interface AccountBalancesProps {
  balances: AccountBalance[];
  selectedAccounts: { address: string; label: string }[];
}

export const AccountBalances = ({ balances, selectedAccounts }: AccountBalancesProps) => {
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleExpand = (activityId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(activityId)) {
      newExpanded.delete(activityId);
    } else {
      newExpanded.add(activityId);
    }
    setExpandedItems(newExpanded);
  };

  const formatActivityId = (activityId: string) => {
    return activityId;
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getAccountLabel = (address: string) => {
    const account = selectedAccounts.find(acc => acc.address === address);
    return account?.label || formatAddress(address);
  };

  const selectedBalance = selectedAccount 
    ? balances.find(b => b.accountAddress === selectedAccount)
    : null;

  const totalUsdValue = selectedBalance?.data.reduce((sum, item) => 
    sum + Number.parseFloat(item.usdValue || '0'), 0
  ) || 0;

  return (
    <div className="w-full md:col-span-full rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-lg font-medium">Account Balances Preview</h3>
          <div className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
            <AlertTriangle className="h-3 w-3" />
            Preview Only
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground mb-4">
          Select one of your connected accounts to view the latest snapshot data. 
          This feature will not be available in the production incentives program.
        </p>

        {balances.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-muted-foreground">
              <p className="text-sm">No balance snapshots available</p>
              <p className="text-xs mt-1">
                Snapshots are taken hourly. Check back later for data.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {selectedAccounts.map((account) => {
                const hasBalance = balances.some(b => b.accountAddress === account.address);
                return (
                  <Button
                    key={account.address}
                    variant={selectedAccount === account.address ? "default" : "outline"}
                    size="sm"
                    disabled={!hasBalance}
                    onClick={() => setSelectedAccount(
                      selectedAccount === account.address ? null : account.address
                    )}
                    className="text-xs"
                  >
                    {account.label}
                    {!hasBalance && <span className="ml-1 text-muted-foreground">(No data)</span>}
                  </Button>
                );
              })}
            </div>

            {selectedBalance && (
              <div className="border rounded-lg">
                <div className="p-4 border-b bg-muted/20">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">{getAccountLabel(selectedBalance.accountAddress)}</h4>
                      <p className="text-xs text-muted-foreground font-mono">
                        {selectedBalance.accountAddress}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Last updated: {selectedBalance.timestamp.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold">${totalUsdValue.toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">Total USD Value</p>
                    </div>
                  </div>
                </div>

                <div className="max-h-96 overflow-y-auto">
                  <div className="p-4 space-y-2">
                    {selectedBalance.data
                      .sort((a, b) => Number.parseFloat(b.usdValue || '0') - Number.parseFloat(a.usdValue || '0'))
                      .map((item, index) => {
                        const itemKey = `${selectedAccount}-${item.activityId}-${index}`;
                        const isExpanded = expandedItems.has(itemKey);
                        const usdValue = Number.parseFloat(item.usdValue || '0');
                        
                        return (
                          <div key={itemKey} className="border rounded p-3">
                            <button 
                              className="flex items-center justify-between w-full text-left"
                              onClick={() => toggleExpand(itemKey)}
                              aria-expanded={isExpanded}
                              type="button"
                            >
                              <div className="flex items-center gap-2">
                                {item.metadata ? (
                                  isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
                                ) : <div className="w-4" />}
                                <span className="text-sm font-medium">
                                  {formatActivityId(item.activityId)}
                                </span>
                              </div>
                              <span className="text-sm font-semibold">
                                ${usdValue.toFixed(6)}
                              </span>
                            </button>

                            {isExpanded && item.metadata && (
                              <div className="mt-2 pl-6 text-xs space-y-1">
                                {Object.entries(item.metadata).map(([key, value]) => (
                                  <div key={key} className="flex justify-between">
                                    <span className="text-muted-foreground capitalize">
                                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:
                                    </span>
                                    <span className="font-mono">
                                      {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};