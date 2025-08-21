import React from 'react';
import { FamilyTree } from '../families/family-tree';

const Dashboard: React.FC = () => {
  return (
    <div>
      <FamilyTree
        root={{
          id: '',
          name: '',
          children: undefined,
        }}
      />
    </div>
  );
};

export default Dashboard;
