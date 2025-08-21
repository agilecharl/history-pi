import React from 'react';

type FamilyMember = {
  id: string;
  name: string;
  children?: FamilyMember[];
};

type FamilyTreeProps = {
  root: FamilyMember;
};

const renderTree = (member: FamilyMember) => (
  <li key={member.id}>
    {member.name}
    {member.children && member.children.length > 0 && (
      <ul>{member.children.map((child) => renderTree(child))}</ul>
    )}
  </li>
);

export const FamilyTree: React.FC<FamilyTreeProps> = ({ root }) => (
  <div>
    <h2>Family Tree</h2>
    <ul>{renderTree(root)}</ul>
  </div>
);
