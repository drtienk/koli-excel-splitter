import React from 'react';

interface Activity {
  'Activity Center Code': string;
  'Activity Code': string;
  'hours': string | number;
  'customer ID': string;
  'product ID': string;
}

interface ActivityDriverPreviewProps {
  activities: Activity[];
  totalActivities: number;
}

export default function ActivityDriverPreview({ activities, totalActivities }: ActivityDriverPreviewProps) {
  if (!activities || activities.length === 0) return null;

  const preview = activities.slice(0, 10);

  return (
    <div className="preview-container">
      <h3>Customer Visit Time Sheet Preview (First 10)</h3>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Activity Center Code</th>
              <th>Activity Code</th>
              <th>Hours</th>
              <th>Customer ID</th>
              <th>Product ID</th>
            </tr>
          </thead>
          <tbody>
            {preview.map((activity, idx) => (
              <tr key={idx}>
                <td>{activity['Activity Center Code']}</td>
                <td>{activity['Activity Code']}</td>
                <td>{activity['hours']}</td>
                <td>{activity['customer ID']}</td>
                <td>{activity['product ID']}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p style={{ marginTop: '10px', color: '#999', fontSize: '0.9em' }}>
        Showing 1–{Math.min(10, totalActivities)} of {totalActivities} records
      </p>
    </div>
  );
}
