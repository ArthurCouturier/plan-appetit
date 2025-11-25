export default interface CreateCollectionRequest {
    name: string;
    isPublic: boolean;
    parentCollectionUuid?: string | null;
}
