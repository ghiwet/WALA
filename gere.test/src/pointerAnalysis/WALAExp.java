package pointerAnalysis;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

import com.ibm.wala.cast.ipa.callgraph.GlobalObjectKey;
import com.ibm.wala.classLoader.CallSiteReference;
import com.ibm.wala.classLoader.IMethod;
import com.ibm.wala.classLoader.NewSiteReference;
import com.ibm.wala.ipa.callgraph.CGNode;
import com.ibm.wala.ipa.callgraph.CallGraph;
import com.ibm.wala.ipa.callgraph.propagation.ConstantKey;
import com.ibm.wala.ipa.callgraph.propagation.HeapModel;
import com.ibm.wala.ipa.callgraph.propagation.InstanceKey;
import com.ibm.wala.ipa.callgraph.propagation.PointerAnalysisImpl;
import com.ibm.wala.ipa.callgraph.propagation.PointerKey;
import com.ibm.wala.ipa.callgraph.propagation.StringConstantCharArray;
import com.ibm.wala.ssa.IR;
import com.ibm.wala.ssa.ReflectiveMemberAccess;
import com.ibm.wala.ssa.SSAFieldAccessInstruction;
import com.ibm.wala.ssa.SSAInstruction;
import com.ibm.wala.util.collections.Pair;
import com.ibm.wala.util.intset.OrdinalSet;

public class WALAExp {
		
	/**
	 * Count the number of distinct reachable functions
	 * in a call graph
	 * @param cg call graph
	 * @return
	 */
	public static int getNumOfFunc(CallGraph cg) {
		
		Collection<IMethod> functions = new ArrayList<IMethod>();
		Iterator<CGNode> nodes = cg.iterator();
		
		while(nodes.hasNext()) {
			CGNode node = nodes.next();
			
			if(!functions.contains(node.getMethod()))
				functions.add(node.getMethod());
		}
		
		return functions.size();
	}
	
	/**
	 * Collect all unique call graph edges merged over calling contexts
	 * @param cg
	 * @return
	 */
	public static Collection<String> cgEdges(CallGraph cg) {
		
		Collection<String> edges = new ArrayList<String>();
		
		Iterator<CGNode> nodes = cg.iterator();
		
		while(nodes.hasNext()) {
			CGNode node = nodes.next();
			Iterator<CGNode> succs = cg.getSuccNodes(node);
			while(succs.hasNext()) {
				CGNode succ = succs.next();
				
				String edge = node.getMethod().toString() + "-" + succ.getMethod().toString();
				
				if(!edges.contains(edge))
					edges.add(edge);
			}
		}
		
		return edges;
	}
	
	/**
	 * Calculate the average points-to set size
	 * for all the pointer keys in the points-to graph
	 * @param pa
	 * @return
	 */
	public static float avgPtsSize(PointerAnalysisImpl pa) {
		
		float count = 0;
		float pts= 0;
		
		Iterator<PointerKey> it = pa.getPointerKeys().iterator();
		
		while(it.hasNext()) {
			PointerKey pk = it.next();
			
			OrdinalSet<InstanceKey> os = pa.getPointsToSet(pk);
			
			count++;
			
			pts += os.size();
		}
		
		return pts/count;
	}
	
	/**
	 * Total number of points-to set sizes summed over
	 * all local variables across all calling contexts
	 * @param cg
	 * @param pa
	 * @return
	 */
	public static int ptsSize(CallGraph cg, PointerAnalysisImpl pa) {
		
		Map<IMethod, Collection<String>> method2pts = ptsSizeMap(cg, pa);
		
		int pts = 0;
		
		for(IMethod m : method2pts.keySet()) {
			pts += method2pts.get(m).size();
		}
		
		return pts;
			
	}
	
	/**
	 * Map between method and local points-to sets of local variables across all calling contexts
	 * @param cg
	 * @param pa
	 * @return
	 */
	public static Map<IMethod, Collection<String>> ptsSizeMap(CallGraph cg, PointerAnalysisImpl pa) {
		
		Iterator<CGNode> nodeIt= cg.iterator();
				
		Map<IMethod, Collection<String>> method2pts = new HashMap<IMethod, Collection<String>>();
		
		while(nodeIt.hasNext()) {
			CGNode node = nodeIt.next();
			
			IMethod method = node.getMethod();
						
			Collection<String> ptset = ptsSize(cg, pa, node);
			
			if(method2pts.containsKey(method)) {
				Collection<String> previous = method2pts.get(method);
				
				method2pts.put(method, merge(previous, ptset));
			} else {
				method2pts.put(method, ptset);
			}
			
		}
		
		return method2pts;
			
	}
	
	/**
	 * Calculate the unique points-to sets of all local variables in a CGNode
	 * @param cg
	 * @param pa
	 * @param node
	 * @return
	 */
	public static Collection<String> ptsSize(CallGraph cg, PointerAnalysisImpl pa, CGNode node) {
										
		IR ir = node.getIR();
		
		Collection<String> ptset = new ArrayList<String>();
		
		Iterator<SSAInstruction> instrIt = ir.iterateAllInstructions();

		Collection<Integer> valuenums = new ArrayList<Integer>();

		while(instrIt.hasNext()) {
			SSAInstruction instr = instrIt.next();
			
			for(int i = 0; i < instr.getNumberOfDefs() ; i++) {
				int valuenum = instr.getDef(i);
				
				if(!valuenums.contains(valuenum)) {
					valuenums.add(valuenum);
					
					PointerKey pk = pa.getHeapModel().getPointerKeyForLocal(node, valuenum);
					
					OrdinalSet<InstanceKey> os = pa.getPointsToSet(pk);
					
					for(InstanceKey ik : os) {
						String tmp;
						if(!(ik instanceof ConstantKey) && !(ik instanceof GlobalObjectKey) && !(ik instanceof StringConstantCharArray)) {
							Iterator<Pair<CGNode, NewSiteReference>> csIt = ik.getCreationSites(cg);
						
							while(csIt.hasNext()) {
								Pair<CGNode, NewSiteReference> pair = csIt.next();
							
								tmp = pair.fst.getMethod().toString() +  " - " + pair.snd.toString();
							
								if(!ptset.contains(tmp))
									ptset.add(tmp);
							}
						
						} else {
							tmp = ik.toString();
																	
							if(!ptset.contains(tmp))
								ptset.add(tmp);
						}
						
					}
					
				}
			}
			
			for(int i = 0; i < instr.getNumberOfUses() ; i++) {
				int valuenum = instr.getUse(i);
				
				if(!valuenums.contains(valuenum)) {
					valuenums.add(valuenum);
					
					PointerKey pk = pa.getHeapModel().getPointerKeyForLocal(node, valuenum);
					
					OrdinalSet<InstanceKey> os = pa.getPointsToSet(pk);
					
					for(InstanceKey ik : os) {
						if(!(ik instanceof ConstantKey) && !(ik instanceof GlobalObjectKey) && !(ik instanceof StringConstantCharArray)) {
							Iterator<Pair<CGNode, NewSiteReference>> csIt = ik.getCreationSites(cg);
						
							while(csIt.hasNext()) {
								Pair<CGNode, NewSiteReference> pair = csIt.next();
							
								String tmp = pair.fst.getMethod().toString() +  " - " + pair.snd.toString();
							
								if(!ptset.contains(tmp))
									ptset.add(tmp);
							}
						
						} else {
							String tmp = ik.toString();
																	
							if(!ptset.contains(tmp))
								ptset.add(tmp);
						}
						
					}
					
				}
			}
		}
		
		return ptset;
	}
	
	/**
	 * Count average number of targets over all call sites in the call graph
	 * @param cg
	 * @return
	 */
	public static float avgTargets(CallGraph cg) {
		float targets = 0;
		float count = 0;
		Iterator<CGNode> it = cg.iterator();
		while(it.hasNext()) {
			CGNode node = it.next();
			Iterator<CallSiteReference> csrIt =  node.iterateCallSites();
			while(csrIt.hasNext()) {
				targets += cg.getNumberOfTargets(node, csrIt.next());
				count++;
			}
		}
		return targets/count;
	}
	
	/**
	 * Count the number of targets of function calls in a call graph node
	 * @param cg
	 * @return
	 */
	public static int targetSize(CallGraph cg, CGNode node) {
		int count = 0;
		Iterator<CallSiteReference> csrIt =  node.iterateCallSites();
		while(csrIt.hasNext()) {
			count += cg.getNumberOfTargets(node, csrIt.next());
		}
		return count;
	}
	
	/**
	 * Count the point-to set sizes of field accesses in a call graph node
	 * @param node
	 * @param pa
	 * @return
	 */
	public static int refSize(CGNode node, PointerAnalysisImpl pa) {
		int refSize = 0;
		IR ir = node.getIR();
		HeapModel hm = pa.getHeapModel();
		Iterator<SSAInstruction> it = ir.iterateNormalInstructions();
		while(it.hasNext()) {
			SSAInstruction inst = it.next();
			if(inst instanceof SSAFieldAccessInstruction) {
				SSAFieldAccessInstruction fai = (SSAFieldAccessInstruction)inst;
				if(fai.getUse(0) != -1) {
					PointerKey pk = hm.getPointerKeyForLocal(node, fai.getUse(0));
					refSize += pa.getPointsToSet(pk).size();
				}
			} else if(inst instanceof ReflectiveMemberAccess) {
				ReflectiveMemberAccess rma = (ReflectiveMemberAccess)inst;
				if(rma.getUse(1) != -1) {
					PointerKey pk = hm.getPointerKeyForLocal(node, rma.getUse(1));
					refSize += pa.getPointsToSet(pk).size();
				}
			}
		}
		return refSize;
	}
	
	private static Collection<String> merge(Collection<String> c1, Collection<String> c2) {		
		for(String s : c2) {
			if(!c1.contains(s)) {
				c1.add(s);
			}
		}		
		return c1;		
	}	
	
}
